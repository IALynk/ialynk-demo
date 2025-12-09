"use client";

type Comment = {
  id: string;
  author: string;
  content: string;
  created_at: string;
};

type Props = {
  comments: Comment[];
};

export function CommentList({ comments }: Props) {
  if (!comments.length) {
    return (
      <p className="text-sm text-gray-400">
        Aucun commentaire interne pour l’instant.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {comments.map((c) => (
        <div key={c.id} className="border rounded-lg bg-gray-50 px-3 py-2">
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">
              {c.author}
            </span>
            <span className="text-[11px] text-gray-400">
              {new Date(c.created_at).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">
            {c.content}
          </p>
        </div>
      ))}
    </div>
  );
}
