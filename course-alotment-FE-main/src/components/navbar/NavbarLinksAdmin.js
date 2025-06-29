// Chakra Imports
import {
  Avatar,
  Button,
  Flex,
  Icon,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  Box,
  Badge,
  Tooltip,
} from "@chakra-ui/react";
// Custom Components
import { ItemContent } from "components/menu/ItemContent";
import { SearchBar } from "components/navbar/searchBar/SearchBar";
import { SidebarResponsive } from "components/sidebar/Sidebar";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
// Assets
import navImage from "assets/img/layout/Navbar.png";
import { MdNotificationsNone, MdInfoOutline, MdChat } from "react-icons/md";
import { FaEthereum } from "react-icons/fa";
import routes from "routes.js";
import { ThemeEditor } from "./ThemeEditor";
import { useHistory } from "react-router-dom"; // Change to useHistory

export default function HeaderLinks(props) {
  const { secondary } = props;
  const history = useHistory(); // Use useHistory instead of useNavigate

  // Chakra Color Mode
  const navbarIcon = useColorModeValue("gray.400", "white");
  let menuBg = useColorModeValue("white", "navy.800");
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorBrand = useColorModeValue("brand.700", "brand.400");
  const ethColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("#E6ECFA", "rgba(135, 140, 189, 0.3)");
  const ethBg = useColorModeValue("secondaryGray.300", "navy.900");
  const ethBox = useColorModeValue("white", "navy.800");
  const shadow = useColorModeValue(
    "14px 17px 40px 4px rgba(112, 144, 176, 0.18)",
    "14px 17px 40px 4px rgba(112, 144, 176, 0.06)"
  );
  const borderButton = useColorModeValue("secondaryGray.500", "whiteAlpha.200");

  // State for unread messages count
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulate fetching unread messages count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        setUnreadCount(3); // Temporary mock data
      } catch (error) {
        console.error("Error fetching unread messages:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Poll every minute

    return () => clearInterval(interval);
  }, []);

  const handleChatClick = () => {
    history.push("/admin/chat"); // Use history.push instead of navigate
  };

  return (
    <Flex
      w={{ sm: "100%", md: "auto" }}
      alignItems="center"
      flexDirection="row"
      bg={menuBg}
      flexWrap={secondary ? { base: "wrap", md: "nowrap" } : "unset"}
      p="10px"
      borderRadius="30px"
      boxShadow={shadow}
    >
      <SidebarResponsive routes={routes} />

      {/* Chat Button */}
      <Tooltip label="Messages" hasArrow>
        <Button
          p="0px"
          bg="transparent"
          color={navbarIcon}
          _hover={{ bg: "transparent" }}
          _focus={{ bg: "transparent" }}
          _active={{ bg: "transparent" }}
          onClick={handleChatClick}
          position="relative"
          mr="10px"
        >
          <Badge
            colorScheme="red"
            borderRadius="full"
            position="absolute"
            top="-2px"
            right="-2px"
            fontSize="10px"
            display={unreadCount > 0 ? "flex" : "none"}
            alignItems="center"
            justifyContent="center"
            w="18px"
            h="18px"
          >
            {unreadCount}
          </Badge>
          <Icon me="0px" as={MdChat} w="20px" h="20px" color={navbarIcon} />
        </Button>
      </Tooltip>

      {/* Notifications */}
      <Menu>
        <MenuButton p="0px" mr="10px">
          <Icon
            mt="6px"
            as={MdNotificationsNone}
            color={navbarIcon}
            w="18px"
            h="18px"
            me="10px"
          />
        </MenuButton>
        <MenuList
          boxShadow={shadow}
          p="20px"
          borderRadius="20px"
          bg={menuBg}
          border="none"
          mt="22px"
          me={{ base: "30px", lg: "30px" }}
          minW={{ base: "unset", lg: "400px", xl: "450px" }}
          maxW={{ base: "360px", lg: "unset" }}
        >
          <Flex w="100%" mb="20px">
            <Text fontSize="md" fontWeight="600" color={textColor}>
              Notifications
            </Text>
            <Text
              fontSize="sm"
              fontWeight="500"
              color={textColorBrand}
              ms="auto"
              cursor="pointer"
            >
              Mark all read
            </Text>
          </Flex>
          <Flex flexDirection="column">
            <MenuItem
              _hover={{ bg: "none" }}
              _focus={{ bg: "none" }}
              px="0"
              borderRadius="8px"
              mb="10px"
            >
              <ItemContent time="9 minutes ago" info="New message from John" />
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>

      {/* User Profile Menu */}
      <Menu>
        <MenuButton p="0px">
          <Avatar
            _hover={{ cursor: "pointer" }}
            color="white"
            name="User"
            bg="#11047A"
            size="sm"
            w="40px"
            h="40px"
          />
        </MenuButton>
        <MenuList
          boxShadow={shadow}
          p="20px"
          borderRadius="20px"
          bg={menuBg}
          border="none"
          mt="22px"
          me={{ base: "30px", lg: "30px" }}
          minW={{ base: "unset" }}
          maxW={{ base: "360px", lg: "unset" }}
        >
          <Flex w="100%" mb="20px">
            <Text fontSize="md" fontWeight="600" color={textColor}>
              Profile
            </Text>
          </Flex>
          <MenuItem
            _hover={{ bg: "none" }}
            _focus={{ bg: "none" }}
            borderRadius="8px"
            px="14px"
            onClick={() => history.push("/admin/profile")} // Use history.push
          >
            <Text fontSize="sm">Profile Settings</Text>
          </MenuItem>
          <MenuItem
            _hover={{ bg: "none" }}
            _focus={{ bg: "none" }}
            borderRadius="8px"
            px="14px"
            onClick={() => history.push("/admin/settings")} // Use history.push
          >
            <Text fontSize="sm">Account Settings</Text>
          </MenuItem>
          <MenuItem
            _hover={{ bg: "none" }}
            _focus={{ bg: "none" }}
            color="red.400"
            borderRadius="8px"
            px="14px"
            onClick={() => {
              localStorage.removeItem("user");
              history.push("/auth/sign-in"); // Use history.push
            }}
          >
            <Text fontSize="sm">Log out</Text>
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
}

HeaderLinks.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func,
};