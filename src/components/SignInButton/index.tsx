import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FiX } from "react-icons/fi";

import styles from "./styles.module.scss";

export function SignInButton() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(true);

  return isUserLoggedIn ? (
    <button type="button" className={styles.singInButton}>
      <FaGithub color="#04d361" />
      Yan Lyra
      <FiX color="#737380" className={styles.closeIcon} />
    </button>
  ) : (
    <button type="button" className={styles.singInButton}>
      <FaGithub color="#eda417" />
      Sign in with Github
    </button>
  );
}
