import React from "react";
import { Link } from "react-router-dom";

export const Lobby: React.FC = () => {
  return (
    <div>
      {" "}
      <Link to="/room/123">Room 123</Link>{" "}
    </div>
  );
};

export default Lobby;
