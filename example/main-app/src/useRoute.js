import React from "react";

export default function useRoute() {
  const [route, setRoute] = React.useState(window.location.pathname);

  React.useEffect(() => {
    window.addEventListener("popstate", () => {
      setRoute(window.location.pathname);
    });

    return () => {
      window.removeEventListener("popstate", () => {
        setRoute(window.location.pathname);
      });
    };
  }, []);

  return route;
}
