import type { Context } from "koa";
import prisma from "../utils/prisma.js";

class UserController {
  // Get user profile by ID
  async getById(ctx: Context) {
    const { id } = ctx.params;
    const currentUserId = (ctx.state.user as { userId?: number })?.userId;

    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          school: true,
          department: true,
          bio: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              followedBy: true,
              following: true,
            },
          },
        },
      });

      if (!user) {
        ctx.status = 404;
        ctx.body = { error: "User not found" };
        return;
      }

      // Check if current user is following this user
      let isFollowing = false;
      let isFollowedBy = false;
      if (currentUserId && currentUserId !== Number(id)) {
        const [followRecord, followedByRecord] = await Promise.all([
          prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: currentUserId,
                followingId: Number(id),
              },
            },
          }),
          prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: Number(id),
                followingId: currentUserId,
              },
            },
          }),
        ]);
        isFollowing = !!followRecord;
        isFollowedBy = !!followedByRecord;
      }

      const isMutual = isFollowing && isFollowedBy;

      ctx.body = {
        ...user,
        postsCount: user._count.posts,
        followersCount: user._count.followedBy,
        followingCount: user._count.following,
        isFollowing,
        isFollowedBy,
        isMutual,
        isSelf: currentUserId === Number(id),
      };
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get user's posts
  async getPosts(ctx: Context) {
    const { id } = ctx.params;
    const page = Number(ctx.query.page) || 1;
    const limit = Number(ctx.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
      const posts = await prisma.post.findMany({
        where: { userId: Number(id) },
        skip,
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
              isVerified: true,
            },
          },
          _count: {
            select: { interactions: true },
          },
        },
      });

      // Get likes and comments count
      const postsWithCounts = await Promise.all(
        posts.map(async (post) => {
          const likesCount = await prisma.interaction.count({
            where: { postId: post.id, type: "like" },
          });
          const commentsCount = await prisma.interaction.count({
            where: { postId: post.id, type: "comment" },
          });
          return {
            ...post,
            likes: likesCount,
            comments: commentsCount,
          };
        })
      );

      ctx.body = postsWithCounts;
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Follow/Unfollow user
  async toggleFollow(ctx: Context) {
    const { id } = ctx.params;
    const currentUserId = (ctx.state.user as { userId: number }).userId;
    const targetUserId = Number(id);

    if (currentUserId === targetUserId) {
      ctx.status = 400;
      ctx.body = { error: "Cannot follow yourself" };
      return;
    }

    try {
      const existing = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId,
          },
        },
      });

      if (existing) {
        // Unfollow
        await prisma.follow.delete({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: targetUserId,
            },
          },
        });
        ctx.body = { isFollowing: false, isMutual: false };
      } else {
        // Follow
        await prisma.follow.create({
          data: {
            followerId: currentUserId,
            followingId: targetUserId,
          },
        });
        // Check if it's now a mutual follow
        const reverseFollow = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: targetUserId,
              followingId: currentUserId,
            },
          },
        });
        ctx.body = { isFollowing: true, isMutual: !!reverseFollow };
      }
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get user's followers
  async getFollowers(ctx: Context) {
    const { id } = ctx.params;
    const currentUserId = (ctx.state.user as { userId?: number })?.userId;
    const page = Number(ctx.query.page) || 1;
    const limit = Number(ctx.query.limit) || 20;
    const skip = (page - 1) * limit;

    try {
      const followers = await prisma.follow.findMany({
        where: { followingId: Number(id) },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              school: true,
              department: true,
              isVerified: true,
              bio: true,
            },
          },
        },
      });

      // Check follow status for each follower
      const followersWithStatus = await Promise.all(
        followers.map(async (f) => {
          let isFollowing = false;
          let isFollowedBy = true; // They follow the target user
          if (currentUserId && currentUserId !== f.follower.id) {
            const followRecord = await prisma.follow.findUnique({
              where: {
                followerId_followingId: {
                  followerId: currentUserId,
                  followingId: f.follower.id,
                },
              },
            });
            isFollowing = !!followRecord;
            // Check if this follower follows current user
            const reverseRecord = await prisma.follow.findUnique({
              where: {
                followerId_followingId: {
                  followerId: f.follower.id,
                  followingId: currentUserId,
                },
              },
            });
            isFollowedBy = !!reverseRecord;
          }
          return {
            ...f.follower,
            isFollowing,
            isFollowedBy,
            isMutual: isFollowing && isFollowedBy,
            isSelf: currentUserId === f.follower.id,
          };
        })
      );

      const total = await prisma.follow.count({
        where: { followingId: Number(id) },
      });

      ctx.body = {
        users: followersWithStatus,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get users that user is following
  async getFollowing(ctx: Context) {
    const { id } = ctx.params;
    const currentUserId = (ctx.state.user as { userId?: number })?.userId;
    const page = Number(ctx.query.page) || 1;
    const limit = Number(ctx.query.limit) || 20;
    const skip = (page - 1) * limit;

    try {
      const following = await prisma.follow.findMany({
        where: { followerId: Number(id) },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              school: true,
              department: true,
              isVerified: true,
              bio: true,
            },
          },
        },
      });

      // Check follow status for each following user
      const followingWithStatus = await Promise.all(
        following.map(async (f) => {
          let isFollowing = true; // Current profile owner follows them
          let isFollowedBy = false;
          if (currentUserId && currentUserId !== f.following.id) {
            // Check if current user follows this person
            const followRecord = await prisma.follow.findUnique({
              where: {
                followerId_followingId: {
                  followerId: currentUserId,
                  followingId: f.following.id,
                },
              },
            });
            isFollowing = !!followRecord;
            // Check if this person follows current user
            const reverseRecord = await prisma.follow.findUnique({
              where: {
                followerId_followingId: {
                  followerId: f.following.id,
                  followingId: currentUserId,
                },
              },
            });
            isFollowedBy = !!reverseRecord;
          }
          return {
            ...f.following,
            isFollowing,
            isFollowedBy,
            isMutual: isFollowing && isFollowedBy,
            isSelf: currentUserId === f.following.id,
          };
        })
      );

      const total = await prisma.follow.count({
        where: { followerId: Number(id) },
      });

      ctx.body = {
        users: followingWithStatus,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get clubs owned by current user
  async getOwnedClubs(ctx: Context) {
    const userId = (ctx.state.user as { userId: number }).userId;
    try {
      const clubs = await prisma.club.findMany({
        where: { ownerId: userId },
        select: { id: true, name: true, logo: true },
      });
      ctx.body = clubs;
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Failed to fetch owned clubs",
      };
    }
  }

  // Update user profile
  async updateProfile(ctx: Context) {
    const userId = (ctx.state.user as { userId: number }).userId;
    const { name, bio, avatar, school, department } = ctx.request.body as {
      name?: string;
      bio?: string;
      avatar?: string;
      school?: string;
      department?: string;
    };

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          bio,
          avatar,
          school,
          department,
        },
      });

      ctx.body = updatedUser;
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Failed to update profile",
      };
    }
  }
}

export default new UserController();
