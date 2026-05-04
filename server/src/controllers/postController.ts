import type { Context } from "koa";
import type { Prisma } from "@prisma/client";
import prisma from "../utils/prisma.js";

class PostController {
  // Create a new post
  async create(ctx: Context) {
    const { content, image, type, isAnonymous } = ctx.request.body as {
      content?: string;
      image?: string;
      type?: string;
      isAnonymous?: boolean;
    };
    const userId = (ctx.state.user as { userId: number }).userId;

    // At least content or image is required
    if (!content?.trim() && !image) {
      ctx.status = 400;
      ctx.body = { error: "Content or image is required" };
      return;
    }

    try {
      const post = await prisma.post.create({
        data: {
          content: content?.trim() || "",
          image: image ?? null,
          type: type || "normal",
          isAnonymous: !!isAnonymous,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              school: true,
              department: true,
              isVerified: true,
            },
          },
        },
      });

      ctx.status = 201;
      ctx.body = post;
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get feed posts (with basic pagination)
  async getAll(ctx: Context) {
    const page = Number(ctx.query.page) || 1;
    const limit = Number(ctx.query.limit) || 10;
    const skip = (page - 1) * limit;
    const tab = ctx.query.tab as string; // 'recommend', 'follow', 'hot'
    const type = ctx.query.type as string; // 'normal', 'lost_found', 'trade', 'confession'
    const userId = (ctx.state.user as { userId?: number })?.userId;

    try {
      // Basic query options
      const where: Prisma.PostWhereInput = {};
      const orderBy: Prisma.PostOrderByWithRelationInput = {
        createdAt: "desc",
      };

      if (type) {
        where.type = type;
      } else {
        // Exclude paper plane posts from the main feed
        where.type = { not: "paper_plane" };
      }

      if (tab === "follow" && userId) {
        // Only posts from users I follow
        const following = await prisma.follow.findMany({
          where: { followerId: userId },
          select: { followingId: true },
        });
        const followingIds = following.map((f) => f.followingId);
        where.userId = { in: followingIds };
      } else if (tab === "hot") {
        // ... (sorting by interactions count logic if needed)
      }

      const posts = await prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              school: true,
              department: true,
              isVerified: true,
            },
          },
          _count: {
            select: { interactions: true },
          },
        },
      });

      // Transform to add isLiked and isBookmarked if user is logged in
      const postsWithStatus = await Promise.all(
        posts.map(async (post) => {
          let isLiked = false;
          let isBookmarked = false;
          if (userId) {
            const like = await prisma.interaction.findFirst({
              where: {
                postId: post.id,
                userId: userId,
                type: "like",
              },
            });
            isLiked = !!like;

            const bookmark = await prisma.interaction.findFirst({
              where: {
                postId: post.id,
                userId: userId,
                type: "bookmark",
              },
            });
            isBookmarked = !!bookmark;
          }

          // Get real counts
          const likesCount = await prisma.interaction.count({
            where: { postId: post.id, type: "like" },
          });
          const commentsCount = await prisma.interaction.count({
            where: { postId: post.id, type: "comment" },
          });
          const bookmarksCount = await prisma.interaction.count({
            where: { postId: post.id, type: "bookmark" },
          });

          // Anonymity Logic
          const displayUser = post.isAnonymous
            ? {
                id: 0,
                username: "anonymous",
                name: "匿名用户",
                avatar: null,
                school: null,
                department: null,
                isVerified: false,
              }
            : post.user;

          return {
            ...post,
            user: displayUser,
            isLiked,
            isBookmarked,
            likes: likesCount,
            comments: commentsCount,
            bookmarks: bookmarksCount,
          };
        })
      );

      ctx.body = postsWithStatus;
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Interact (Like / Bookmark)
  async interact(ctx: Context) {
    const { id } = ctx.params;
    const userId = (ctx.state.user as { userId: number }).userId;
    const { type } = ctx.request.body as { type?: string }; // 'like' or 'bookmark'

    try {
      if (type === "like" || type === "bookmark") {
        // Check if already exists
        const existing = await prisma.interaction.findFirst({
          where: {
            postId: Number(id),
            userId,
            type,
          },
        });

        if (existing) {
          // Remove
          await prisma.interaction.delete({ where: { id: existing.id } });
          ctx.body =
            type === "like" ? { isLiked: false } : { isBookmarked: false };
        } else {
          // Add
          await prisma.interaction.create({
            data: {
              postId: Number(id),
              userId,
              type,
            },
          });
          ctx.body =
            type === "like" ? { isLiked: true } : { isBookmarked: true };
        }
      } else {
        ctx.status = 400;
        ctx.body = { error: "Unsupported interaction type" };
      }
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get post by ID with details
  async getById(ctx: Context) {
    const { id } = ctx.params;
    const userId = (ctx.state.user as { userId?: number })?.userId;

    try {
      const post = await prisma.post.findUnique({
        where: { id: Number(id) },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              school: true,
              department: true,
              isVerified: true,
            },
          },
          _count: {
            select: { interactions: true },
          },
        },
      });

      if (!post) {
        ctx.status = 404;
        ctx.body = { error: "Post not found" };
        return;
      }

      // Get likes count
      const likesCount = await prisma.interaction.count({
        where: { postId: Number(id), type: "like" },
      });

      // Get comments count
      const commentsCount = await prisma.interaction.count({
        where: { postId: Number(id), type: "comment" },
      });

      // Check if current user liked
      let isLiked = false;
      if (userId) {
        const like = await prisma.interaction.findFirst({
          where: { postId: Number(id), userId, type: "like" },
        });
        isLiked = !!like;
      }

      // Anonymity Logic
      const displayUser = post.isAnonymous
        ? {
            id: 0,
            username: "anonymous",
            name: "匿名用户",
            avatar: null,
            school: null,
            department: null,
            isVerified: false,
          }
        : post.user;

      ctx.body = {
        ...post,
        user: displayUser,
        likes: likesCount,
        comments: commentsCount,
        isLiked,
      };
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Add comment to post
  async addComment(ctx: Context) {
    const { id } = ctx.params;
    const userId = (ctx.state.user as { userId: number }).userId;
    const { content } = ctx.request.body as { content?: string };

    if (!content || !content.trim()) {
      ctx.status = 400;
      ctx.body = { error: "Comment content is required" };
      return;
    }

    try {
      const comment = await prisma.interaction.create({
        data: {
          postId: Number(id),
          userId,
          type: "comment",
          content: content.trim(),
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              school: true,
              department: true,
            },
          },
        },
      });

      ctx.status = 201;
      ctx.body = comment;
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get comments for a post
  async getComments(ctx: Context) {
    const { id } = ctx.params;
    const page = Number(ctx.query.page) || 1;
    const limit = Number(ctx.query.limit) || 20;
    const skip = (page - 1) * limit;

    try {
      const comments = await prisma.interaction.findMany({
        where: {
          postId: Number(id),
          type: "comment",
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              school: true,
              department: true,
            },
          },
        },
      });

      const total = await prisma.interaction.count({
        where: { postId: Number(id), type: "comment" },
      });

      ctx.body = {
        comments,
        total,
        page,
        hasMore: skip + comments.length < total,
      };
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Search posts and users
  async search(ctx: Context) {
    const q = (ctx.query.q as string)?.trim();
    const type = (ctx.query.type as string) || "all"; // 'all', 'posts', 'users'
    const limit = Number(ctx.query.limit) || 20;

    if (!q) {
      ctx.body = { posts: [], users: [], clubs: [] };
      return;
    }

    try {
      const results: {
        posts?: unknown[];
        users?: unknown[];
        clubs?: unknown[];
      } = {};

      // Search posts
      if (type === "all" || type === "posts") {
        const posts = await prisma.post.findMany({
          where: {
            content: {
              contains: q,
            },
          },
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                school: true,
                department: true,
              },
            },
            _count: {
              select: { interactions: true },
            },
          },
        });
        const postsWithCounts = await Promise.all(
          posts.map(async (post) => {
            const likesCount = await prisma.interaction.count({
              where: { postId: post.id, type: "like" },
            });
            const commentsCount = await prisma.interaction.count({
              where: { postId: post.id, type: "comment" },
            });
            const bookmarksCount = await prisma.interaction.count({
              where: { postId: post.id, type: "bookmark" },
            });

            return {
              ...post,
              likes: likesCount,
              comments: commentsCount,
              bookmarks: bookmarksCount,
            };
          })
        );
        results.posts = postsWithCounts;
      }

      // Search users
      if (type === "all" || type === "users") {
        const users = await prisma.user.findMany({
          where: {
            OR: [{ name: { contains: q } }, { username: { contains: q } }],
          },
          take: limit,
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            school: true,
            department: true,
            bio: true,
          },
        });
        results.users = users;
      }

      // Search clubs
      if (type === "all" || type === "clubs") {
        const clubs = await prisma.club.findMany({
          where: {
            OR: [{ name: { contains: q } }, { description: { contains: q } }],
          },
          take: limit,
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
            memberCount: true,
          },
        });
        results.clubs = clubs;
      }

      ctx.body = results;
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Catch a random paper plane
  async getRandomPaperPlane(ctx: Context) {
    const userId = (ctx.state.user as { userId: number }).userId;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      // Fetch eligible post IDs first to randomize efficiently
      const eligiblePosts = await prisma.post.findMany({
        where: {
          type: "paper_plane",
          userId: { not: userId },
          createdAt: { gte: twentyFourHoursAgo },
        },
        select: { id: true },
      });

      if (eligiblePosts.length === 0) {
        ctx.body = null;
        return;
      }

      const randomIndex = Math.floor(Math.random() * eligiblePosts.length);
      const randomId = eligiblePosts[randomIndex].id;

      const post = await prisma.post.findUnique({
        where: { id: randomId },
        select: {
          id: true,
          content: true,
          createdAt: true,
        },
      });

      ctx.body = post;
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export default new PostController();
