export default function FestivalTemplate({
  title,
  subtitle,
  description,
  image,
}: {
  title: string;
  subtitle: string;
  description: string;
  image: string;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <img
        src={image}
        alt={title}
        style={{
          width: "100%",
          height: "500px",
          objectFit: "cover",
        }}
      />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        <h1
          style={{
            fontSize: "56px",
            marginBottom: "10px",
          }}
        >
          {title}
        </h1>

        <h2
          style={{
            color: "#ff3a00",
            marginBottom: "20px",
          }}
        >
          {subtitle}
        </h2>

        <p
          style={{
            fontSize: "18px",
            lineHeight: 1.8,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
