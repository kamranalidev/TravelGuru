import { Avatar, Badge } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { getInitials } from "../../utils/formatters";

const UserAvatar = ({ user, size = 40, showBadge = false, online = false }) => {
  if (!user) {
    return (
      <Avatar
        size={size}
        icon={<UserOutlined />}
        style={{ backgroundColor: "#6366F1" }}
      />
    );
  }

  const avatarContent = user.profile_picture ? (
    <Avatar size={size} src={user.profile_picture} />
  ) : (
    <Avatar
      size={size}
      style={{
        backgroundColor: "#6366F1",
        fontWeight: 600,
      }}
    >
      {getInitials(user.full_name || user.email)}
    </Avatar>
  );

  if (showBadge) {
    return (
      <Badge dot status={online ? "success" : "default"} offset={[-5, 5]}>
        {avatarContent}
      </Badge>
    );
  }

  return avatarContent;
};

export default UserAvatar;
