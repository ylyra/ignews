import Image from "next/image";
import Link from "next/link";

import { SignInButton } from "@components/SignInButton";

import styles from "./styles.module.scss";

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Image
          src="/images/logo.svg"
          width="110"
          height="31"
          alt="Logo ig.news"
        />

        <nav>
          <Link href="/">
            <a>Home</a>
          </Link>

          <Link href="/">
            <a>Posts</a>
          </Link>
        </nav>

        <SignInButton />
      </div>
    </header>
  );
}
