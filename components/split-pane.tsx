export function SplitPane({
  list,
  detail,
}: {
  list: React.ReactNode;
  detail: React.ReactNode;
}) {
  return (
    <div className="lg:grid lg:h-full lg:min-h-0 lg:grid-cols-[minmax(300px,400px)_minmax(0,1fr)]">
      <div className="lg:overflow-y-auto lg:border-r lg:border-border lg:px-6 lg:py-8">{list}</div>
      <div className="hidden lg:block lg:overflow-y-auto lg:px-14 lg:py-12">{detail}</div>
    </div>
  );
}
