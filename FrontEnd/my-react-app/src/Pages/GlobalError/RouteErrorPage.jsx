import { isRouteErrorResponse, useRouteError, Link } from "react-router-dom";

export default function RouteErrorPage() {
  const error = useRouteError();

  let title = "Something went wrong";
  let message = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message =
      error.status === 404
        ? "The page you are looking for does not exist."
        : error.data || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>{title}</h1>
      <p>{message}</p>
      <Link to="/">Go back home</Link>
    </main>
  );
}
