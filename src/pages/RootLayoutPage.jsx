import { Outlet } from "react-router-dom";

import Header from "../components/Header";
import Message from "../components/Message";
import Username from "../components/Username";
import CreatePresentation from "../components/CreatePresentation";

export default function RootLayoutPage() {
  return (
    <>
      <Header />
      <Username />
      <CreatePresentation />
      <Message />
      <Outlet />
    </>
  );
}
