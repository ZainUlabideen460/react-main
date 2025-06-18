import { Box, Icon, SimpleGrid, useColorModeValue } from "@chakra-ui/react";
import axios from "axios";
// Custom components
// import MiniCalendar from "components/calendar/MiniCalendar";
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdBook, MdClass, MdCoPresent, MdLibraryBooks, MdMeetingRoom, MdPeople } from "react-icons/md";
import Zain from "./Zain";

export default function UserReports() {
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");

  const [dashboardData, setDashboardData] = useState({});
  const [studentCount, setStudentCount] = useState(0);

  // Fetch student count from the /student/count endpoint
  const fetchStudentCount = async () => {
    try {
      const response = await axios.get("http://localhost:3001/student/count");
      setStudentCount(response.data.count);
    } catch (error) {
      toast.error("Failed to fetch student count");
      console.error("Error fetching student count:", error);
    }
  };

  // Fetch dashboard data from the /dashboard endpoint
  const getDashboardData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/dashboard");
      setDashboardData(response.data);
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
      console.error("Error fetching dashboard data:", error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchStudentCount();
    getDashboardData();
  }, []);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      {/* Cards */}
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3, "2xl": 6 }}
        gap="20px"
        mb="20px"
      >
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={
                <Icon w="32px" h="32px" as={MdPeople} color={brandColor} />
              }
            />
          }
          name="Total Students"
          value={studentCount}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={
                <Icon w="32px" h="32px" as={MdCoPresent} color={brandColor} />
              }
            />
          }
          name="Total Teachers"
          value={dashboardData.teachers || 0}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={
                <Icon w="32px" h="32px" as={MdClass} color={brandColor} />
              }
            />
          }
          name="Total Sections"
          value={dashboardData.sections || 0}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={
                <Icon w="32px" h="32px" as={MdMeetingRoom} color={brandColor} />
              }
            />
          }
          name="Total Rooms"
          value={dashboardData.rooms || 0}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={
                <Icon w="32px" h="32px" as={MdBook} color={brandColor} />
              }
            />
          }
          name="Total Courses"
          value={dashboardData.courses || 0}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={
                <Icon w="32px" h="32px" as={MdLibraryBooks} color={brandColor} />
              }
            />
          }
          name="Total Course Offerings"
          value={dashboardData.coursesoffering || 0}
        />
      </SimpleGrid>

      {/* Table */}
      <Zain onUpdate={fetchStudentCount} />
    </Box>
  );
}