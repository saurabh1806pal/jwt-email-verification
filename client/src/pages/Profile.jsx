import { useSelector } from "react-redux";

export default function Profile() {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>Welcome {user.firstname}</h2>
      <p>Email: {user.email}</p>
      <p>Verified: {user.isAccountVerified ? "Yes" : "No"}</p>
    </div>
  );
}
