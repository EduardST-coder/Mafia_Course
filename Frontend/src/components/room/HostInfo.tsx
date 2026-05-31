type Props = {
  hostName: string;
};

export default function HostInfo({
  hostName
}: Props) {
  return (
    <div className="host-info">
      Ведучий: {hostName}
    </div>
  );
}