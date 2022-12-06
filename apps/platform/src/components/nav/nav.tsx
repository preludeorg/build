import { BuildIcon } from "@theprelude/ds";
import classNames from "classnames/bind";
import styles from "./nav.module.css";

const cx = classNames.bind(styles);

const Nav: React.FC = () => {
  return (
    <nav className={cx("nav")}>
      <section className={cx("top")}>
        <a className={cx("item", { active: true })}>
          <BuildIcon />
        </a>
      </section>
    </nav>
  );
};

export default Nav;
