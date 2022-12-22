import { BuildIcon, PulseIcon } from "@theprelude/ds";
import classNames from "classnames/bind";
import { Link, useLocation } from "react-router-dom";
import styles from "./nav.module.css";

const cx = classNames.bind(styles);

const Nav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className={cx("nav")}>
      <section className={cx("top")}>
        <Link
          to="/"
          className={cx("item", { active: location.pathname === "/" })}
        >
          <PulseIcon />
        </Link>
        <Link
          to="/build"
          className={cx("item", { active: location.pathname === "/build" })}
        >
          <BuildIcon />
        </Link>
      </section>
    </nav>
  );
};

export default Nav;
