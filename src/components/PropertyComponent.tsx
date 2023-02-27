interface Props {
  name: string;
  value: any;
  description?: string;
}

export default function PropertyComponent({ name, value, description }: Props) {
  return (
    <div>
      <p className="property-name">{name}</p>
      <p>{value}</p>
      <p className="text-xs">{description ? `(${description})` : ""}</p>
    </div>
  );
}
