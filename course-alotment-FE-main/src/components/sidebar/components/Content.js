// // chakra imports
// import { Box, Flex, Stack } from "@chakra-ui/react";
// //   Custom components
// import Brand from "components/sidebar/components/Brand";
// import Links from "components/sidebar/components/Links";
// import React from "react";

// // FUNCTIONS

// function SidebarContent(props) {
//   const { routes } = props;
//   // SIDEBAR
//   return (
//     <Flex
//       direction="column"
//       height="100%"
//       pt="25px"
//       px="16px"
//       borderRadius="30px"
//     >
//       <Brand />
//       <Stack direction="column" mb="auto" mt="8px">
//         <Box ps="20px" pe={{ md: "16px", "2xl": "1px" }}>
//           <Links routes={routes} />
//         </Box>
//       </Stack>
//     </Flex>
//   );
// }

// export default SidebarContent;
import React from "react";
import { Box, Flex, Stack, Image, Text } from "@chakra-ui/react";
import SidebarLinks from "components/sidebar/components/Links";
import routes from "routes"; // Import the routes you defined
// import Logo from "path-to-logo/logo.png"; // Replace with your logo path

function SidebarContent() {
  return (
    <Flex
      direction="column"
      height="100%"
      pt="25px"
      px="16px"
      borderRadius="1px"
      bg="gray.800"
      color="white"
    >
      {/* Logo at the top */}
      <Flex align="center" direction="column" mb="20px">
        {/* <Image src={Logo} alt="Logo" boxSize="80px" /> */}
        <Text fontSize="xl" fontWeight="bold" mt="10px">
          Admin Panel
        </Text>
      </Flex>

      <Stack direction="column" mb="auto" mt="8px">
        <Box ps="20px" pe={{ md: "16px", "2xl": "1px" }}>
          <SidebarLinks routes={routes} />
        </Box>
      </Stack>
    </Flex>
  );
}

export default SidebarContent;
