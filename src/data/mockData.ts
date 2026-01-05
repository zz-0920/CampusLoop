export interface User {
  id: string;
  name: string;
  avatar: string;
  school: string;
  department: string;
  isVerified?: boolean;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  time: string;
}

export interface Club {
  id: string;
  name: string;
  logo: string;
  memberCount: number;
  description: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
}

export interface Candidate extends User {
  bio: string;
  interests: string[];
}

export const currentUser: User = {
  id: "u0",
  name: "王大锤",
  avatar:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop",
  school: "清华大学",
  department: "经济管理学院",
  isVerified: true,
};

export const mockPosts: Post[] = [
  {
    id: "p1",
    author: {
      id: "u1",
      name: "李小明",
      avatar:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=120&h=120&fit=crop",
      school: "北京大学",
      department: "计算机学院",
    },
    content:
      "今天在图书馆学习了 React Native，感觉开发移动端应用很有趣！大家有没有好用的学习资源推荐？",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    likes: 124,
    comments: 42,
    shares: 8,
    time: "2小时前",
  },
  {
    id: "p2",
    author: {
      id: "u2",
      name: "张雨欣",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
      school: "清华大学",
      department: "艺术学院",
    },
    content: "校园里的樱花开了，真的好漂亮啊！明天有人一起去拍照吗？",
    image:
      "https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?w=800&q=80",
    likes: 356,
    comments: 89,
    shares: 24,
    time: "5小时前",
  },
];

export const mockNotices = [
  {
    id: "n1",
    title: "校园通知",
    content: "图书馆四楼自习室明起闭馆维修，请同学们移步。",
  },
  {
    id: "n2",
    title: "讲座预告",
    content: "人工智能前沿讲座将于周五下午2点在礼堂举行。",
  },
];

export const mockClubs: Club[] = [
  {
    id: "c1",
    name: "摄影协会",
    logo: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&h=100&fit=crop",
    memberCount: 256,
    description: "记录校园美好瞬间",
  },
  {
    id: "c2",
    name: "街舞社",
    logo: "https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=100&h=100&fit=crop",
    memberCount: 184,
    description: "用舞步点燃青春",
  },
  {
    id: "c3",
    name: "辩论队",
    logo: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=100&h=100&fit=crop",
    memberCount: 92,
    description: "思维火花的碰撞",
  },
];

export const mockEvents: Event[] = [
  {
    id: "e1",
    title: "校园歌手大赛",
    date: "10月25日 19:00",
    location: "大礼堂",
    image:
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=200&fit=crop",
  },
  {
    id: "e2",
    title: "创业沙龙",
    date: "10月28日 14:30",
    location: "创新创业中心",
    image:
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=200&fit=crop",
  },
];

export const mockCandidates: Candidate[] = [
  {
    id: "u3",
    name: "王思齐",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=400&fit=crop",
    school: "清华大学",
    department: "建筑系",
    bio: "喜欢摄影和旅行，希望能遇到志同道合的朋友。",
    interests: ["摄影", "旅行", "建筑"],
  },
];
