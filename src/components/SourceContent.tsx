interface SourceContentProps {
  html: string;
}

export function SourceContent({ html }: SourceContentProps) {
  return (
    <div
      className="prose prose-sm max-w-none text-gray-700"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
