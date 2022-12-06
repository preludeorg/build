import { BuildIcon } from "@theprelude/ds";
import classNames from "classnames/bind";
import { Link } from "react-router-dom";
import styles from "./nav.module.css";

const cx = classNames.bind(styles);

const Nav: React.FC = () => {
  return (
    <nav className={cx("nav")}>
      <section className={cx("top")}>
        <Link to="/build" className={cx("item", { active: true })}>
          <BuildIcon />
        </Link>
        <Link to="/build" className={cx("item", { active: false })}>
          <BuildIcon />
        </Link>
      </section>
    </nav>
  );
};

export default Nav;
