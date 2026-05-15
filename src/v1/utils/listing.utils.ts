import type { User } from "@prisma/client";

const HOST_PUBLIC_SELECT = {
  id: true,
  name: true,
  avatar: true,
  isSuperhost: true,
  createdAt: true,
} as const;

export { HOST_PUBLIC_SELECT };

type HostFields = Pick<User, "id" | "name" | "avatar" | "isSuperhost" | "createdAt">;

export function sanitizeHost(host: HostFields) {
  return {
    id: host.id,
    name: host.name,
    avatar: host.avatar,
    isSuperhost: host.isSuperhost,
    hostingSince: host.createdAt,
  };
}

export function formatReview(review: {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  user: { name: string; avatar: string | null };
}) {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    author: {
      name: review.user.name,
      avatar: review.user.avatar,
    },
  };
}
