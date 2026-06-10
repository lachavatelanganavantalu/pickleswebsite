type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export default function JsonLd({ data }: { data: JsonValue | JsonValue[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
