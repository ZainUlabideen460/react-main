// /* eslint-disable */
// import React from "react";
// import { NavLink, useLocation } from "react-router-dom";
// // chakra imports
// import { Box, Flex, HStack, Text, useColorModeValue } from "@chakra-ui/react";

// export function SidebarLinks(props) {
//   //   Chakra color mode
//   let location = useLocation();
//   let activeColor = useColorModeValue("gray.700", "white");
//   let inactiveColor = useColorModeValue(
//     "secondaryGray.600",
//     "secondaryGray.600"
//   );
//   let activeIcon = useColorModeValue("brand.500", "white");
//   let textColor = useColorModeValue("secondaryGray.500", "white");
//   let brandColor = useColorModeValue("brand.500", "brand.400");

//   const { routes } = props;

//   // verifies if routeName is the one active (in browser input)
//   const activeRoute = (routeName) => {
//     return location.pathname.includes(routeName);
//   };

//   // this function creates the links from the secondary accordions (for example auth -> sign-in -> default)
//   const createLinks = (routes) => {
//     return routes.map((route, index) => {
//       if (route.category) {
//         return (
//           <>
//             <Text
//               fontSize={"md"}
//               color={activeColor}
//               fontWeight="bold"
//               mx="auto"
//               ps={{
//                 sm: "10px",
//                 xl: "16px",
//               }}
//               pt="18px"
//               pb="12px"
//               key={index}
//             >
//               {route.name}
//             </Text>
//             {createLinks(route.items)}
//           </>
//         );
//       } else if (
//         route.layout === "/admin" ||
//         route.layout === "/auth" ||
//         route.layout === "/rtl"
//       ) {
//         return (
//           <NavLink key={index} to={route.layout + route.path}>
//             {route.icon ? (
//               <Box>
//                 <HStack
//                   spacing={
//                     activeRoute(route.path.toLowerCase()) ? "22px" : "26px"
//                   }
//                   py="5px"
//                   ps="10px"
//                 >
//                   <Flex w="100%" alignItems="center" justifyContent="center">
//                     <Box
//                       display={"flex"}
//                       color={
//                         activeRoute(route.path.toLowerCase())
//                           ? activeIcon
//                           : textColor
//                       }
//                       me="18px"
//                     >
//                       {route.icon}
//                     </Box>
//                     <Text
//                       me="auto"
//                       color={
//                         activeRoute(route.path.toLowerCase())
//                           ? activeColor
//                           : textColor
//                       }
//                       fontWeight={
//                         activeRoute(route.path.toLowerCase())
//                           ? "bold"
//                           : "normal"
//                       }
//                     >
//                       {route.name}
//                     </Text>
//                   </Flex>
//                   <Box
//                     h="36px"
//                     w="4px"
//                     bg={
//                       activeRoute(route.path.toLowerCase())
//                         ? brandColor
//                         : "transparent"
//                     }
//                     borderRadius="5px"
//                   />
//                 </HStack>
//               </Box>
//             ) : (
//               <Box>
//                 <HStack
//                   spacing={
//                     activeRoute(route.path.toLowerCase()) ? "22px" : "26px"
//                   }
//                   py="5px"
//                   ps="10px"
//                 >
//                   <Text
//                     me="auto"
//                     color={
//                       activeRoute(route.path.toLowerCase())
//                         ? activeColor
//                         : inactiveColor
//                     }
//                     fontWeight={
//                       activeRoute(route.path.toLowerCase()) ? "bold" : "normal"
//                     }
//                   >
//                     {route.name}
//                   </Text>
//                   <Box h="36px" w="4px" bg="brand.400" borderRadius="5px" />
//                 </HStack>
//               </Box>
//             )}
//           </NavLink>
//         );
//       }
//     });
//   };
//   //  BRAND
//   return createLinks(routes);
// }

// export default SidebarLinks;
/* eslint-disable */
/* eslint-disable */
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Box,
  Flex,
  HStack,
  Text,
  useColorModeValue,
  IconButton,
  Collapse,
  Icon,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

export function SidebarLinks({ routes }) {
  let location = useLocation();
  let activeColor = useColorModeValue("gray.700", "white");
  let inactiveColor = useColorModeValue("secondaryGray.600", "secondaryGray.600");
  let activeIcon = useColorModeValue("brand.500", "white");
  let textColor = useColorModeValue("secondaryGray.500", "white");

  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionName) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const activeRoute = (routeName) => location.pathname.includes(routeName);

  const createLinks = (routes) => {
    return routes.map((route, index) => {
      if (route.items) {
        return (
          <Box key={index} ml="10px" mt="10px">
            <Flex
              align="center"
              justify="space-between"
              onClick={() => toggleSection(route.name)}
              cursor="pointer"
              _hover={{ color: activeColor }}
            >
              <HStack spacing="12px">
                <Icon as={route.icon} w="20px" h="20px" color={openSections[route.name] ? activeColor : textColor} />
                <Text color={openSections[route.name] ? activeColor : textColor} fontWeight={openSections[route.name] ? "bold" : "normal"}>
                  {route.name}
                </Text>
              </HStack>
              <IconButton
                size="xs"
                bg="transparent"
                icon={openSections[route.name] ? <ChevronUpIcon /> : <ChevronDownIcon />}
                aria-label="Expand"
              />
            </Flex>

            <Collapse in={openSections[route.name]} animateOpacity>
              <Box pl="20px" pt="5px">
                {createLinks(route.items)}
              </Box>
            </Collapse>
          </Box>
        );
      } else {
        return (
          <NavLink key={index} to={route.layout + route.path}>
            <HStack
              spacing="12px"
              py="10px"
              ps="15px"
              _hover={{ color: activeColor }}
              cursor="pointer"
            >
              <Icon as={route.icon} w="20px" h="20px" color={activeRoute(route.path) ? activeColor : textColor} />
              <Text color={activeRoute(route.path) ? activeColor : textColor} fontWeight={activeRoute(route.path) ? "bold" : "normal"}>
                {route.name}
              </Text>
            </HStack>
          </NavLink>
        );
      }
    });
  };

  return <Box>{createLinks(routes)}</Box>;
}

export default SidebarLinks;
