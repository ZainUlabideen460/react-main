
import React from "react";
import {
  MdDashboard,
  MdOutlineSchool,
  MdBook,
  MdCoPresent,
  MdViewAgenda, // For Sections and Timetable
} from "react-icons/md"; // Ensure correct icon imports
import { FaLaptopCode, FaDatabase, FaBrain } from "react-icons/fa"; // For technical components like Infra

// Admin Imports
import MainDashboard from "views/admin/dashboard";
import TeachersTable from "views/admin/teachers";
import StudentsTable from "views/admin/students";
import CoursesTable from "views/admin/courses";
import CourseOffering from "views/admin/courseOffering/variables";
import InfraTable from "views/admin/infraStucture/variables";
import sectionsTable from 'views/admin/sections';
import TimeTable from "views/admin/timetable";
import teacherview from "views/admin/teacherview/variable";
import studentview from "views/admin/studentview/variable";
import ViewTimetable from 'views/admin/viewtimetable/variable';
import ChatPage from 'views/admin/chat';

const routes = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "/dashboard",
    icon: MdDashboard, // Dashboard Icon
    component: MainDashboard,
  },
  {
    name: "Courses",
    layout: "/admin",
    path: "/courses",
    icon: MdBook, // Books/Courses Icon
    component: CoursesTable,
  },
  {
    name: "Teachers",
    layout: "/admin",
    path: "/teachers",
    icon: MdCoPresent, // Teachers Icon (Co-Presenter)
    component: TeachersTable,
  },
  {
    name: "Sections",
    layout: "/admin",
    path: "/secctions",
    icon: MdViewAgenda, // View Agenda/Sections Icon
    component: sectionsTable,
  },
  {
    name: "CourseOffering",
    layout: "/admin",
    path: "/courseoffering",
    icon: MdBook, // Offering Icon (Book/Offering)
    component: CourseOffering,
  },
  {
    name: "InfraStructure",
    layout: "/admin",
    path: "/infrastructure",
    icon: FaDatabase, // Infrastructure Icon (Database)
    component: InfraTable,
  },
  {
    name: "Settings",
    layout: "/admin",
    path: "/timetable",
    icon: MdViewAgenda, // Timetable Icon (View Agenda)
    component: TimeTable,
  },
  {
    name: "View Timetable",
    layout: "/admin",
    path: "/viewtimetable",
    icon: MdViewAgenda, // View Timetable Icon (View Agenda)
    component: ViewTimetable,
  },
  {
    name: "Teacher View",
    layout: "/admin",
    path: "/teacherview",
    icon: MdCoPresent, // Teachers Icon
    component: teacherview,
  },
  {
    name: "Students View",
    layout: "/admin",
    path: "/studentview",
    icon: MdOutlineSchool, // Students Icon (School)
    component: studentview,
  },
  {
    name: "Students",
    layout: "/admin",
    path: "/students",
    icon: MdOutlineSchool, // Students Icon
    component: StudentsTable,
  },
  {
    name: "Chat",
    layout: "/admin",
    path: "/chat",
    icon: MdCoPresent,
    component: ChatPage,
  }
];

export default routes;
