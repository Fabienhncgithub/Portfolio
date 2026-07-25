import Link from "next/link";

const links = [
  ["Archive", "/archive"],
  ["About", "/about"],
  ["Contact", "/contact"],
] as const;

export function Header() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Fabien Hance, accueil">
        Fabien Hance
      </Link>
      <nav aria-label="Navigation principale">
        {links.map(([label, href]) => (
          <Link className="nav-link" href={href} key={href}>
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
