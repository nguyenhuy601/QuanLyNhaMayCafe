import Dashboard from "../pages/Dashboard";
import PhanCong from "../pages/PhanCong";

const routes = [
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/phancong",
    element: <PhanCong />,
  },
];

export default routes;
