import { BuildIcon } from "@theprelude/ds";
import classNames from "classnames/bind";
import styles from "./nav.module.css";

const cx = classNames.bind(styles);

const Nav: React.FC = () => {
  return (
    <nav className={cx("nav")}>
      <section className={cx("top")}>
        <a href="/" className={cx("item", { active: true })}>
          <BuildIcon />
        </a>
        <a href="/build" className={cx("item", { active: false })}>
          <BuildIcon />
        </a>
      </section>
    </nav>
  );
};

export default Nav;
