// index.js

const { PrismaClient } = require("@prisma/client");
const express = require("express");
const http = require('http');
const initializeSocket = require('./socket');

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);
app.set('socketio', io);
const prisma = new PrismaClient();
const cors = require("cors");
const multer = require("multer");
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const { contains } = require("list");
const { error } = require("console");
const upload = multer({ dest: "uploads/" });
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { authenticateToken, validateRegisterInput, validateLoginInput, requireTeacher } = require('./middlewares/auth');
app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


async function main() {
  await prisma.$connect();
  
  // Setup automatic reactivation of canceled classes after 12 hours
  setupAutomaticClassReactivation();
  const chatRoutes = require('./routes/chat');
  app.use('/api/chat', chatRoutes);
  // ------------- Dashboard Endpoints -------------

  // Dashboard
  app.get("/dashboard", async (req, res) => {
    try {
      // const students = await prisma.Student.findMany();
      const teachers = await prisma.teacher.findMany();
      const courses = await prisma.course.findMany();
      const sections =await prisma.section.findMany();
      const rooms=await prisma.room.findMany();
      const coursesoffering=await prisma.courseoffering.findMany();

      // const classes = await prisma.Class.findMany();
      res.json({
        // students: students.length,
        teachers: teachers.length,
        courses: courses.length,
        sections:sections.length,
        rooms:rooms.length,
        coursesoffering: coursesoffering.length,
        // classes: classes.length,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to retrieve dashboard data",
        error: error.message,
        
      });
      console.log(error);
    }
  });

  // ------------- Students Endpoints -------------
  app.get('/student/count', async (req, res) => {
    try {
      const students = await prisma.user.findMany({
        where: { role: 'student' },
      });
      res.json({
        count: students.length,
      });
    } catch (err) {
      console.error('Error in GET /student/count:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  // GET - All Students
  app.get("/students", async (req, res) => {
    try {
      const students = await prisma.student.findMany();
      res.json(students);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to retrieve students", error: error.message });
    }
  });

  // POST - Create Student
  app.post("/students", async (req, res) => {
    const {
      name,
      cnic,
      aridno,
      degree,
      shift,
      semester,
      section,
      courses,
      classes_info,
      password,
    } = req.body;
    if (
      !name ||
      !cnic ||
      !aridno ||
      !degree ||
      !shift ||
      !semester ||
      !section ||
      !courses ||
      !classes_info
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    try {
      const student = await prisma.student.create({
        data: {
          name,
          cnic,
          aridno,
          degree,
          shift,
          semester,
          section,
          courses,
          classes_info,
          password,
        },
      });
      res.json(student);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to create student", error: error.message });
    }
  });

  // PUT - Update Student
  app.put("/students/:id", async (req, res) => {
    const studentId = parseInt(req.params.id);
    if (isNaN(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }
    try {
      const student = await prisma.student.update({
        where: { id: studentId },
        data: req.body,
      });
      res.json(student);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to update student", error: error.message });
    }
  });

  // GET - Student by Aridno
  app.get("/students/:aridno", async (req, res) => {
    const aridno = req.params.aridno;
    try {
      const student = await prisma.student.findUnique({
        where: { aridno: aridno },
      });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Assuming classes_info contains an array of classroom names
      const classrooms = JSON.parse(student.classes_info).map((info) => info.classroom);

      const classesData = await Promise.all(
        classrooms.map(async (classroom) => {
          const classInfo = await prisma.class.findFirst({
            where: { classroom: classroom },
          });
          return classInfo;
        })
      );

      // Attach classesData to the student object
      student.classesData = classesData.filter(
        (classInfo) => classInfo !== null
      );

      res.json(student);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch student", error: error.message });
    }
  });

  // GET - Classes taught by a Teacher
  app.get("/teachers/:name/classes", async (req, res) => {
    const teacherName = req.params.name;
    try {
      // Fetch all classes taught by the specified teacher
      const classes = await prisma.class.findMany({
        where: { teacher: teacherName },
      });

      if (!classes.length) {
        return res
          .status(404)
          .json({ message: "No classes found for this teacher" });
      }

      res.json({ classesData: classes });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch classes", error: error.message });
    }
  });

  // DELETE - Remove Student
  app.delete("/students/:id", async (req, res) => {
    const studentId = parseInt(req.params.id);
    if (isNaN(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }
    try {
      await prisma.student.delete({
        where: { id: studentId },
      });
      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to delete student", error: error.message });
    }
  });

  // PUT - Update Student Password
  app.put("/students/password/:id", async (req, res) => {
    const studentId = parseInt(req.params.id);
    const { password } = req.body;

    if (isNaN(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    try {
      const updatedStudent = await prisma.student.update({
        where: { id: studentId },
        data: { password: password },
      });
      res.json({
        message: "Password updated successfully",
        updatedStudent: { id: updatedStudent.id, name: updatedStudent.name },
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update student's password",
        error: error.message,
      });
    }
  });

  // ------------- Teachers Endpoints -------------
// GET - Retrieve all teachers
app.get("/teachers", async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany();
    const teachersWithParsedCourses = teachers.map(teacher => ({
      ...teacher,
      courses: Array.isArray(teacher.courses) ? teacher.courses : JSON.parse(teacher.courses || "[]"),
    }));
    res.json(teachersWithParsedCourses);
  } catch (error) {
    console.error("Error retrieving teachers:", error);
    res.status(500).json({ 
      message: "Failed to retrieve teachers", 
      error: error.message 
    });
  }
});


// POST - Create new teacher
app.post("/teachers", async (req, res) => {
  const { name, cnic, teacherid, qualification, gender, courses, password } = req.body;

  if (!name || !cnic || !teacherid || !qualification || !gender || !courses) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const teacher = await prisma.teacher.create({
      data: {
        name,
        cnic,
        teacherid,
        qualification,
        gender,
        courses: JSON.stringify(courses), // Ensure JSON format
        password,
        updateAt: new Date(),
      },
    });
    res.json(teacher);
  } catch (error) {
    console.error("Error creating teacher:", error);
    res.status(500).json({ message: "Failed to create teacher", error: error.message });
  }
});


// PUT - Update teacher
app.put("/teachers/:id", async (req, res) => {
  const teacherId = parseInt(req.params.id);
  if (isNaN(teacherId)) {
    return res.status(400).json({ message: "Invalid teacher ID" });
  }
  try {
    const teacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: req.body,
    });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to update teacher", 
      error: error.message 
    });
  }
});

// DELETE - Remove teacher
app.delete("/teachers/:id", async (req, res) => {
  const teacherId = parseInt(req.params.id);
  if (isNaN(teacherId)) {
    return res.status(400).json({ message: "Invalid teacher ID" });
  }
  try {
    await prisma.teacher.delete({
      where: { id: teacherId },
    });
    res.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to delete teacher", 
      error: error.message 
    });
  }
});

// File upload endpoint
app.post('/teachers/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    for (const row of data) {
      const { name, cnic, teacherid, qualification, gender } = row;

      if (!name || !cnic || !teacherid || !qualification || !gender) {
        console.warn(`Skipping row due to missing fields: ${JSON.stringify(row)}`);
        continue;
      }

      const teacheridStr = teacherid.toString();
      const cnicStr = cnic.toString();

      const coursesArray = Object.keys(row)
        .filter(key => key.toLowerCase().startsWith('course'))
        .map(key => row[key])
        .filter(course => course != null && course !== '');

      try {
        await prisma.teacher.create({
          data: {
            name,
            cnic: cnicStr,
            teacherid: teacheridStr,
            qualification,
            gender,
            courses: coursesArray,
            password: '12345678',
            updateAt:new Date(),
          },
        });
      } catch (insertError) {
        console.error(`Failed to insert row: ${JSON.stringify(row)}, Error: ${insertError.message}`);
        if (insertError.code === 'P2002') {
          console.error(`Duplicate entry for unique field in row: ${JSON.stringify(row)}`);
        }
      }
    }

    fs.unlinkSync(file.path);
    res.json({ message: 'Teachers uploaded successfully' });
  } catch (error) {
    console.error('Error during file upload:', error);
    res.status(500).json({ 
      message: 'Failed to upload teachers', 
      error: error.message 
    });
  }
});


  // PUT - Update Teacher Password
  app.put("/teachers/password/:id", async (req, res) => {
    const teacherId = parseInt(req.params.id);
    const { password } = req.body;

    if (isNaN(teacherId)) {
      return res.status(400).json({ message: "Invalid teacher ID" });
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    try {
      const updatedTeacher = await prisma.teacher.update({
        where: { id: teacherId },
        data: { password: password },
      });
      res.json({
        message: "Password updated successfully",
        updatedTeacher: { id: updatedTeacher.id, name: updatedTeacher.name },
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update teacher's password",
        error: error.message,
      });
    }
  });

  
  // ------------- Classes Endpoints -------------

  // POST - Create Class
  app.post("/classes", async (req, res) => {
    const {
      name,
      semester,
      section,
      shift,
      day,
      classroom,
      classtime,
      teacher,
      course,
    } = req.body;
    if (
      !name ||
      !semester ||
      !section ||
      !shift ||
      !day ||
      !classroom ||
      !classtime ||
      !teacher ||
      !course
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      let [hours, minutes] = classtime.split(":");
      let classtimeDate = new Date();
      classtimeDate.setHours(parseInt(hours), parseInt(minutes), 0);

      classtimeDate.setHours(classtimeDate.getHours() + 1);
      const classtime_end = classtimeDate.toTimeString().slice(0, 5);

      const existingClass = await prisma.class.findFirst({
        where: {
          classroom: classroom,
          classtime: classtime,
          semester: semester,
          section: section,
          shift: shift,
          day: day,
        },
      });

      if (existingClass) {
        return res.status(400).json({
          message:
            "A class with the same classroom, semester, section, shift, and day already exists at this time.",
        });
      }

      const newClass = await prisma.class.create({
        data: {
          name,
          semester,
          section,
          shift,
          day,
          classroom,
          classtime,
          teacher,
          course,
          classtime_end: classtime_end,
        },
      });
      res.json(newClass);
    } catch (error) {
      if (error.code === "P2002") {
        // Prisma unique constraint violation error code
        res.status(400).json({
          message:
            "Unique constraint failed. A class with the same classroom already exists at this time.",
        });
      } else {
        res
          .status(500)
          .json({ message: "Failed to create class", error: error.message });
      }
    }
  });

  // GET - All Classes
  app.get("/classes", async (req, res) => {
    try {
      const classes = await prisma.class.findMany();
      res.json(classes);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to retrieve classes", error: error.message });
    }
  });

  // GET - Specific Class by ID
  app.get("/classes/:id", async (req, res) => {
    const classId = parseInt(req.params.id);
    if (isNaN(classId)) {
      return res.status(400).json({ message: "Invalid class ID" });
    }
    try {
      const foundClass = await prisma.class.findUnique({
        where: { id: classId },
      });
      if (foundClass) {
        res.json(foundClass);
      } else {
        res.status(404).json({ message: "Class not found" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to retrieve class", error: error.message });
    }
  });

  // PUT - Update Class
  app.put("/classes/:id", async (req, res) => {
    const classId = parseInt(req.params.id);
    const {
      name,
      semester,
      section,
      shift,
      day,
      classroom,
      classtime,
      teacher,
      course,
    } = req.body;
    if (
      isNaN(classId) ||
      !name ||
      !semester ||
      !section ||
      !shift ||
      !day ||
      !classroom ||
      !classtime ||
      !teacher ||
      !course
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      let [hours, minutes] = classtime.split(":");
      let classtimeDate = new Date();
      classtimeDate.setHours(parseInt(hours), parseInt(minutes), 0);

      classtimeDate.setHours(classtimeDate.getHours() + 1);
      const classtime_end = classtimeDate.toTimeString().slice(0, 5);

      const existingClass = await prisma.class.findFirst({
        where: {
          classroom: classroom,
          classtime: classtime,
          semester: semester,
          section: section,
          shift: shift,
          day: day,
          id: { not: classId },
        },
      });

      if (existingClass) {
        return res.status(400).json({
          message:
            "A class with the same classroom, semester, section, shift, and day already exists at this time.",
        });
      }

      const updatedClass = await prisma.class.update({
        where: { id: classId },
        data: {
          name,
          semester,
          section,
          shift,
          day,
          classroom,
          classtime,
          teacher,
          course,
          classtime_end: classtime_end,
        },
      });
      res.json(updatedClass);
    } catch (error) {
      if (error.code === "P2002") {
        // Prisma unique constraint violation error code
        res.status(400).json({
          message:
            "Unique constraint failed. A class with the same classroom already exists at this time.",
        });
      } else {
        res
          .status(500)
          .json({ message: "Failed to update class", error: error.message });
      }
    }
  });

  // DELETE - Remove Class
  app.delete("/classes/:id", async (req, res) => {
    const classId = parseInt(req.params.id);
    if (isNaN(classId)) {
      return res.status(400).json({ message: "Invalid class ID" });
    }
    try {
      await prisma.class.delete({
        where: { id: classId },
      });
      res.json({ message: "Class deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to delete class", error: error.message });
    }
  });

  // POST - Bulk Import Classes via Excel/CSV
  app.post("/import-classes", upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, {
        header: 1,
      });

      for (const row of data) {
        const [
          CLASS_NAME,
          SEMESTER,
          SECTION,
          SHIFT,
          CLASSROOM,
          CLASS_TIME,
          TEACHER_ID,
          COURSE_CODE,
        ] = row;

        if (SHIFT !== "EVENING" && SHIFT !== "MORNING") continue;
        if (
          SECTION !== "A" &&
          SECTION !== "B" &&
          SECTION !== "C" &&
          SECTION !== "D"
        )
          continue;

        const teacher = await prisma.teacher.findUnique({
          where: { id: parseInt(TEACHER_ID) },
        });
        if (!teacher || !JSON.parse(teacher.courses).includes(COURSE_CODE)) continue;

        await prisma.class.create({
          data: {
            name: CLASS_NAME,
            semester: SEMESTER,
            section: SECTION,
            shift: SHIFT,
            classroom: CLASSROOM,
            classtime: CLASS_TIME,
            teacher: teacher.name,
            course: COURSE_CODE,
          },
        });
      }

      res.json({ message: "Classes imported successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to import classes", error: error.message });
    }
  });

  // ------------- Courses Endpoints -------------

  // POST - Create Course
  app.post("/courses", async (req, res) => {
    const {
      name,
      course_code,
      description,
      credit_hour,
      theory_classes,
      practical_classes,
      Pre_Reqs,
    
    } = req.body;

    if (!name || !course_code) {
      return res
        .status(400)
        .json({ message: "Name and course code are required" });
    }

    try {
      const newCourse = await prisma.course.create({
        data: {
          name,
          course_code,
          description,
          credit_hour,
          theory_classes,
          practical_classes,
          Pre_Reqs,
          updatedAt:new Date(),
        },
      });
      res.json(newCourse);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({
        message: "Failed to create course",
        error: error.message,
      });
    }
  });

  // GET - All Courses
  app.get("/courses", async (req, res) => {
    try {
      const courses = await prisma.course.findMany();
      res.json(courses);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to retrieve courses", error: error.message });
    }
  });

  // GET - Specific Course by ID
  app.get("/courses/:id", async (req, res) => {
    const courseId = parseInt(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }
    try {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (course) {
        res.json(course);
      } else {
        res.status(404).json({ message: "Course not found" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to retrieve course", error: error.message });
    }
  });

  // PUT - Update Course
  app.put("/courses/:id", async (req, res) => {
    const courseId = parseInt(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }
    try {
      const updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: req.body,
      });
      res.json(updatedCourse);
    } catch (error) {
      if (error.code === "P2025") {
        res.status(404).json({ message: "Course not found" });
      } else {
        res
          .status(500)
          .json({ message: "Failed to update course", error: error.message });
      }
    }
  });

  // DELETE - Remove Course
  app.delete("/courses/:id", async (req, res) => {
    const courseId = parseInt(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }
    try {
      await prisma.course.delete({
        where: { id: courseId },
      });
      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      if (error.code === "P2025") {
        res.status(404).json({ message: "Course not found" });
      } else {
        res
          .status(500)
          .json({ message: "Failed to delete course", error: error.message });
      }
    }
  });

  // POST - Bulk Upload Courses via Excel/CSV
  app.post('/courses/upload', upload.single('file'), async (req, res) => {
    try {
      const filePath = req.file.path;

      // Read the Excel file
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert Excel sheet to JSON
      const coursesData = xlsx.utils.sheet_to_json(worksheet);
      console.log("Parsed Courses Data:", coursesData); // Log to check structure of parsed data

      // Loop through each row in the parsed JSON
      for (const course of coursesData) {
        try {
          console.log(`Processing course: ${course.name}, Pre Reqs: ${course.Pre_Reqs}`); // Debug log for each course

          // Ensure proper handling of Pre_Reqs data, setting to null if not present
          await prisma.course.create({
            data: {
              name: course.name,
              course_code: course.course_code,
              description: course.description || null,
              credit_hour: parseInt(course.credit_hour),
              theory_classes: parseInt(course.theory_classes),
              practical_classes: parseInt(course.practical_classes),
              Pre_Reqs: course.Pre_Reqs || null, // Use course.Pre_Reqs as per the Excel header
              updatedAt:new Date(),
            },
          });
        } catch (error) {
          if (error.code === 'P2002') { // Handle duplicate entries
            console.warn(`Course with code ${course.course_code} already exists. Skipping.`);
          } else {
            throw error; // Log unexpected errors
          }
        }
      }

      // Delete the file after processing
      fs.unlinkSync(filePath);

      res.json({ message: 'Courses uploaded successfully' });
    } catch (error) {
      console.error('Error uploading courses:', error);
      res.status(500).json({ message: 'Failed to upload courses', error: error.message });
    }
  });

  // ------------- Student & Teacher Login Endpoints -------------

  // POST - Student Login
  app.post("/studentlogin", async (req, res) => {
    const { aridno, password } = req.body;

    if (!aridno || !password) {
      return res
        .status(400)
        .json({ message: "Aridno and password are required" });
    }

    try {
      const student = await prisma.student.findFirst({
        where: { aridno: aridno },
      });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      if (student.password === password) {
        res.status(200).json({ message: "Login successful", student });
      } else {
        res.status(401).json({ message: "Invalid password" });
      }
    } catch (error) {
      console.error("Error during student login:", error);
      res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
    }
  });

  // POST - Teacher Login
  app.post("/teacherlogin", async (req, res) => {
    const { teacherid, password } = req.body;

    if (!teacherid || !password) {
      return res
        .status(400)
        .json({ message: "Teacherid and password are required" });
    }

    try {
      const teacher = await prisma.teacher.findFirst({
        where: { teacherid: teacherid },
      });

      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      if (teacher.password === password) {
        res.status(200).json({ message: "Login successful", teacher });
      } else {
        res.status(401).json({ message: "Invalid password" });
      }
    } catch (error) {
      console.error("Error during Teacher login:", error);
      res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
    }
  });

 
  // ------------- Rooms Endpoints -------------

   // ------------- Rooms Endpoints -------------

  // POST - Create Room
  app.post("/rooms", async (req, res) => {
    let { name, type, multimedia, totalSpace, occupiedSpace, totalPCs, availablePCs } = req.body;

    // Map human-readable "Lecture Theater" to "Lecture_Theater" as per the Prisma enum
    type = type === "Lecture Theater" ? "Lecture_Theater" : type;

    if (!name || !type || totalSpace === undefined || occupiedSpace === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      const newRoom = await prisma.room.create({
        data: {
          name,
          type,
          multimedia,
          totalSpace,
          occupiedSpace,
          totalPCs: type === "Lab" ? totalPCs : null,
          availablePCs: type === "Lab" ? availablePCs : null,
        },
      });
      res.json(newRoom);
    } catch (error) {
      res.status(500).json({ message: "Failed to create room", error: error.message });
    }
  });

  // GET - All Rooms
  app.get("/rooms", async (req, res) => {
    try {
      const rooms = await prisma.room.findMany();
      res.json(rooms);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to retrieve rooms", error: error.message });
    }
  });

  // PUT - Update Room
  app.put("/rooms/:id", async (req, res) => {
    const roomId = parseInt(req.params.id);
    const { name, type, multimedia, totalSpace, occupiedSpace, totalPCs, availablePCs } = req.body;

    if (!name || !type || totalSpace === undefined || occupiedSpace === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: {
          name,
          type,
          multimedia,
          totalSpace,
          occupiedSpace,
          totalPCs: type === "Lab" ? totalPCs : null,
          availablePCs: type === "Lab" ? availablePCs : null,
        },
      });
      res.json(updatedRoom);
    } catch (error) {
      res.status(500).json({ message: "Failed to update room", error: error.message });
    }
  });

  // DELETE - Remove Room
  app.delete("/rooms/:id", async (req, res) => {
    const roomId = parseInt(req.params.id);

    try {
      await prisma.room.delete({
        where: { id: roomId },
      });
      res.json({ message: "Room deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to delete room", error: error.message });
    }
  });

  // ------------- Sections Endpoints -------------

  // GET - All Sections
  app.get("/sections", async (req, res) => {
    try {
      const sections = await prisma.section.findMany();
      res.json(sections);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to retrieve sections", error: error.message });
    }
  });

  // POST - Create Section
  app.post('/sections', async (req, res) => {
    try {
      const { degreeName, semester, section, shift, studentCount } = req.body;

      // Validate required fields
      if (!degreeName || !semester || !section || !shift || !studentCount) {
        return res.status(400).json({
          message: 'Missing required fields: degreeName, semester, section, shift, and studentCount are required'
        });
      }

      // Validate field lengths
      if (degreeName.length > 50) {
        return res.status(400).json({ message: 'degreeName must be less than 50 characters' });
      }
      if (section.length > 5) {
        return res.status(400).json({ message: 'section must be less than 5 characters' });
      }
      if (shift.length > 2) {
        return res.status(400).json({ message: 'shift must be less than 2 characters' });
      }

      // Generate sectionDisplay based on the provided fields
      const sectionDisplay = `${degreeName}-${semester}${section}(${shift})`;

      const newSection = await prisma.section.create({
        data: {
          degreeName,
          semester,
          section,
          shift,
          studentCount,
          sectionDisplay,
        }
      });

      res.status(201).json(newSection);
    } catch (error) {
      console.error('Error creating section:', error);
      res.status(500).json({ 
        message: 'Error creating section',
        error: error.message 
      });
    }
  });

  // get Search the sections
  app.get('/sections/search', async (req, res) => {
    const { searchQuery } = req.query;
  
    try {
      let sections = [];
      
      if (searchQuery) {
        // First try to parse the search query as a number for semester
        const semesterNum = parseInt(searchQuery);
        
        // Build the OR conditions array
        const orConditions = [
          {
            degreeName: {
              contains: searchQuery.toUpperCase(),
            }
          },
          {
            section: {
              contains: searchQuery.toUpperCase(),
            }
          },
          {
            shift: {
              contains: searchQuery.toUpperCase(),
            }
          }
        ];
  
        // Only add semester condition if the searchQuery is a valid number
        if (!isNaN(semesterNum)) {
          orConditions.push({
            semester: semesterNum
          });
        }
  
        // Fetch sections with the OR conditions
        sections = await prisma.section.findMany({
          where: {
            OR: orConditions
          }
        });
      } else {
        // If no search query, return all sections
        sections = await prisma.section.findMany();
      }
  
      // If no sections found, send a 404 response
      if (sections.length === 0) {
        return res.status(404).json({ 
          message: 'No sections found matching the provided criteria' 
        });
      }
  
      // Send the matching sections
      res.json(sections);
  
    } catch (error) {
      console.error('Error searching for sections:', error);
      res.status(500).json({
        message: 'Error searching for sections',
        error: error.message,
      });
    }
  });

  // PUT - Update Section
  app.put("/sections/:id", async (req, res) => {
    const sectionId = parseInt(req.params.id);
    const { degreeName, semester, section, shift, studentCount } = req.body;

    if (!degreeName || semester === undefined || !section || !shift || studentCount === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const sectionDisplay = `${degreeName}-${semester}${section}(${shift})`;

    try {
      const updatedSection = await prisma.section.update({
        where: { id: sectionId },
        data: {
          degreeName,
          semester,
          section,
          shift,
          studentCount,
          sectionDisplay,
        },
      });
      res.json(updatedSection);
    } catch (error) {
      res.status(500).json({ message: "Failed to update section", error: error.message });
    }
  });

  // DELETE - Remove Section
  app.delete("/sections/:id", async (req, res) => {
    const sectionId = parseInt(req.params.id);

    try {
      await prisma.section.delete({
        where: { id: sectionId },
      });
      res.json({ message: "Section deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete section", error: error.message });
    }
  });

  // ------------- Course Offerings Endpoints -------------


// POST - Create new course offering
app.post("/courseoffering", async (req, res) => {
  try {
    const { coursename, cr_hrs, contact, teachers, status, section, courses } = req.body;

    if (!coursename || !cr_hrs || !contact || !teachers || !status || !section || !courses) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const { totalCrHrs, theoryClasses, labClasses } = parseCreditHours(cr_hrs);
    const contactInt = parseInt(contact, 10);
    if (isNaN(contactInt)) {
      return res.status(400).json({ message: "Invalid contact number" });
    }

    const parsedSection = typeof section === "string" ? JSON.parse(section) : section;
    const parsedTeachers = typeof teachers === "string" ? JSON.parse(teachers) : teachers;
    const parsedCourses = typeof courses === "string" ? JSON.parse(courses) : courses;

    const courseOffering = await prisma.courseoffering.create({
      data: {
        coursename: coursename.trim(),
        total_cr_hrs: totalCrHrs,
        theory_classes: theoryClasses,
        lab_classes: labClasses,
        contact: contactInt,
        sectionData: JSON.stringify(parsedSection),
        teachers: JSON.stringify(parsedTeachers),
        status: status.trim(),
        courses: JSON.stringify(parsedCourses),
      },
    });

    res.status(201).json(courseOffering);
  } catch (error) {
    console.error("Error creating course offering:", error);
    res.status(500).json({ message: "Failed to create course offering", error: error.message });
  }
});


// Helper function to parse credit hours from the format "1(1-0)"
function parseCreditHours(crHrsString) {
  const match = crHrsString.match(/^(\d+)\((\d+)-(\d+)\)$/);
  if (!match) {
    throw new Error(`Invalid credit hours format: ${crHrsString}`);
  }
  return {
    totalCrHrs: parseInt(match[1], 10),
    theoryClasses: parseInt(match[2], 10),
    labClasses: parseInt(match[3], 10),
  };
}




app.post("/coursesoffering/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const coursesData = xlsx.utils.sheet_to_json(worksheet);
    console.log("Raw Uploaded Data:", coursesData);

    for (const [index, course] of coursesData.entries()) {
      try {
        // Destructure required fields
        const { courses, coursename, total_cr_hrs, contact, sem, teachers, status } = course;

        // Validate required fields
        if (!courses || !coursename || !total_cr_hrs || !contact || !sem || !teachers || !status) {
          console.error(`Missing required fields in course at row ${index + 2}:`, course);
          continue;
        }

        // Parse credit hours
        const { totalCrHrs, theoryClasses, labClasses } = parseCreditHours(total_cr_hrs);

        // Parse section data from 'sem'
        const sectionMatch = sem.match(/([A-Z]+)-(\d+)([A-Z])\(([A-Z])\)/);
        if (!sectionMatch) {
          console.error(`Invalid section format at row ${index + 2}:`, sem);
          continue;
        }

        const [_, program, year, section, shift] = sectionMatch;
        const sectionDisplay = sem;

        // Check if the Section already exists
        let dbSection = await prisma.section.findFirst({
          where: {
            degreeName: program,
            semester: parseInt(year, 10),
            section: section,
            shift: shift,
            sectionDisplay: sectionDisplay,
          },
        });

        // If Section doesn't exist, create it
        if (!dbSection) {
          dbSection = await prisma.section.create({
            data: {
              degreeName: program,
              semester: parseInt(year, 10),
              section: section,
              shift: shift,
              sectionDisplay: sectionDisplay,
              studentCount: 40, // Adjust as needed or derive from data
            },
          });
          console.log(`Created new section: ${dbSection.id} for course at row ${index + 2}`);
        }

        // Fetch teacher records by name
        const teacherNames = teachers.split(',').map(name => name.trim());
        const teacherRecords = await prisma.teacher.findMany({
          where: {
            name: {
              in: teacherNames,
            },
          },
        });

        if (teacherRecords.length === 0) {
          console.error(`No matching teachers found for names at row ${index + 2}: ${teachers}`);
          continue; // Skip this course or handle accordingly
        }

        // Check for missing teachers
        const missingTeachers = teacherNames.filter(name => !teacherRecords.some(tr => tr.name === name));
        if (missingTeachers.length > 0) {
          console.error(`Teachers not found at row ${index + 2}: ${missingTeachers.join(', ')}`);
          continue;
        }

        // Prepare teacher data with IDs
        const teachersData = teacherRecords.map(t => ({ id: t.id, name: t.name }));

        // Save course offering with enhanced sectionData
        const courseOffering = await prisma.courseoffering.create({
          data: {
            courses: JSON.stringify({ course_code: courses.trim(), name: coursename.trim() }),
            coursename: coursename.trim(),
            total_cr_hrs: totalCrHrs,
            theory_classes: theoryClasses,
            lab_classes: labClasses,
            contact: parseInt(contact, 10),
            teachers: JSON.stringify(teachersData),
            status: status.trim(),
            sectionData: JSON.stringify({ 
              id: dbSection.id,
              sectionDisplay: sectionDisplay, // Added
              program: program, // Optional
              year: parseInt(year, 10), // Optional
              section: section, // Optional
              shift: shift, // Optional
              studentCount: dbSection.studentCount, // Optional
            }),
          },
        });

        console.log(`Uploaded course offering: ${coursename} at row ${index + 2}`);
      } catch (error) {
        if (error.code === "P2002") { // Prisma unique constraint violation
          console.warn(`Course with name ${course.coursename} already exists. Skipping.`);
        } else {
          console.error(`Error processing course at row ${index + 2}:`, course, error);
          continue;
        }
      }
    }

    fs.unlinkSync(filePath); // Delete uploaded file
    res.json({ message: "Courses uploaded successfully" });
  } catch (error) {
    console.error("Error uploading courses:", error);
    res.status(500).json({ message: "Failed to upload courses", error: error.message });
  }
});


// search for course offerings
app.get("/courseoffering/search", async (req, res) => {
  try {
    const { coursename, teachers, status, section } = req.query;

    // Build dynamic filters for Prisma query
    const filters = {};

    if (coursename) {
      filters.coursename = {
        contains: coursename, // Partial matching for flexibility
        mode: "insensitive", // Case-insensitive matching
      };
    }

    if (teachers) {
      filters.teachers = {
        contains: teachers, // Partial matching for flexibility
        mode: "insensitive", // Case-insensitive matching
      };
    }

    if (status) {
      filters.status = {
        equals: status.trim(),
        mode: "insensitive", // Case-insensitive matching
      };
    }

    if (section) {
      filters.sectionData = {
        contains: section, // Partial matching within section data
        mode: "insensitive", // Case-insensitive matching
      };
    }

    // Fetch course offerings with applied filters
    const courseOfferings = await prisma.courseoffering.findMany({
      where: filters,
      include: {
        sections: true,
      },
    });

    // Parse nested JSON fields for the response
    const processedCourseOfferings = courseOfferings.map((offering) => ({
      ...offering,
      sectionData: offering.sectionData ? JSON.parse(offering.sectionData) : {},
      courses: offering.courses ? JSON.parse(offering.courses) : [],
      teachers: offering.teachers ? JSON.parse(offering.teachers) : [],
    }));

    res.status(200).json(processedCourseOfferings);
  } catch (error) {
    console.error("Error searching course offerings:", error);
    res.status(500).json({
      message: "Failed to search course offerings",
      error: error.message,
    });
  }
});



app.get("/courseoffering", async (req, res) => {
  try {
    const courseOfferings = await prisma.courseoffering.findMany({
      include: {
        section: true,
      },
    });

    const processedCourseOfferings = courseOfferings.map((offering) => ({
      ...offering,
      sectionData: offering.sectionData ? JSON.parse(offering.sectionData) : {},
      courses: offering.courses ? JSON.parse(offering.courses) : [],
      teachers: offering.teachers ? JSON.parse(offering.teachers) : [],
    }));

    res.json(processedCourseOfferings);
  } catch (error) {
    console.error("Error fetching course offerings:", error);
    res.status(500).json({
      message: "Failed to fetch course offerings",
      error: error.message,
    });
  }
});

  // GET - Specific Course Offering by ID
  app.get("/courseoffering/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const courseOffering = await prisma.courseoffering.findUnique({
        where: { id: parseInt(id) },
      });
      if (!courseOffering) {
        return res.status(404).json({ message: "Course offering not found" });
      }
      res.status(200).json(courseOffering);
    } catch (error) {
      console.error("Error fetching course offering:", error);
      res.status(500).json({ message: "Failed to fetch course offering", error: error.message });
    }
  });


  // PUT - Update Course Offering
app.put('/courseoffering/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      courses,
      coursename,
      cr_hrs,          // Changed from total_cr_hrs
      contact,
      teachers,
      status,
      section,         // Changed from sectionData
    } = req.body;

    // Check for missing required fields
    if (
      !courses ||
      !coursename ||
      !cr_hrs ||
      !contact ||
      !teachers ||
      !status ||
      !section
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Parse credit hours
    const { totalCrHrs, theoryClasses, labClasses } = parseCreditHours(cr_hrs);
    const contactInt = parseInt(contact, 10);
    if (isNaN(contactInt)) {
      return res.status(400).json({ message: "Invalid contact number" });
    }

    // Parse JSON fields if necessary
    const parsedSection = typeof section === "string" ? JSON.parse(section) : section;
    const parsedTeachers = typeof teachers === "string" ? JSON.parse(teachers) : teachers;
    const parsedCourses = typeof courses === "string" ? JSON.parse(courses) : courses;

    // Update the course offering
    const updatedCourseOffering = await prisma.courseoffering.update({
      where: { id: parseInt(id, 10) },
      data: {
        coursename: coursename.trim(),
        total_cr_hrs: totalCrHrs,
        theory_classes: theoryClasses,
        lab_classes: labClasses,
        contact: contactInt,
        sectionData: JSON.stringify(parsedSection), // Ensure JSON string
        teachers: JSON.stringify(parsedTeachers),   // Ensure JSON string
        status: status.trim(),
        courses: JSON.stringify(parsedCourses),     // Ensure JSON string
      },
    });

    res.json(updatedCourseOffering);
  } catch (error) {
    console.error('Error updating course offering:', error);
    res.status(500).json({ message: 'Failed to update course offering', error: error.message });
  }
});


  // DELETE - Remove Course Offering
  app.delete("/courseoffering/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.courseoffering.delete({
        where: { id: parseInt(id, 10) },
      });
      res.status(200).json({ message: "Course offering deleted successfully" });
    } catch (error) {
      console.error("Error deleting course offering:", error);
      res.status(500).json({ message: "Failed to delete course offering", error: error.message });
    }
  });

  // Delete All courseOfferings
  app.delete("/courseOfferingsdelete",async(req,res)=>{
    try{
      await prisma.courseoffering.deleteMany();
      res.status(200).json("courseOfferings deleted successfully");

    }catch(e){
      console.error('Error deleting all course offerings:', e);
      res.status(500).json({message: 'Failed to delete all course offerings', error: e.message});
    }
  })
  // ------------- Timetable Generation ------------
// Function to find an available room
// function findAvailableRoom({ classrooms, timetable, section, timeSlot, day, classType }) {
//   return classrooms.find((room) =>
//     (classType === "theory" ? room.type === "Class" : room.type === "Lab") &&
//     room.totalSpace >= section.studentCount &&
//     !timetable.some(
//       (entry) => entry.roomId === room.id && entry.time === timeSlot && entry.day === day
//     )
//   );
// }
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// // // Function to generate timetable
async function generateTimetable({
  shift,
  startTime,
  endTime,
  classDuration,
  includeBreak,
  breakDuration,
}) {
  // Convert startTime and endTime to Date objects
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  const timeSlots = [];
  const timetable = [];
  const teacherSectionDayCount = {};

  // Calculate dynamic time slots
  let currentTime = new Date(start);
  while (currentTime < end) {
    const nextTime = new Date(currentTime);
    nextTime.setMinutes(currentTime.getMinutes() + parseInt(classDuration, 10));
    if (nextTime > end) break;

    timeSlots.push(currentTime.toTimeString().substr(0, 5));
    currentTime = nextTime;

    if (includeBreak) {
      const breakEndTime = new Date(currentTime);
      breakEndTime.setMinutes(currentTime.getMinutes() + parseInt(breakDuration, 10));
      if (breakEndTime > end) break;
      currentTime = breakEndTime;
    }
  }

  console.log("Generated Time Slots:", timeSlots);

  // Fetch necessary data from the database
  const courseOfferings = await prisma.courseoffering.findMany();
  const classrooms = await prisma.room.findMany();
  const teachers = await prisma.teacher.findMany();
  const sections = await prisma.section.findMany();

  for (const offering of courseOfferings) {
    const theoryClassesToSchedule = offering.theory_classes || 0;
    const labClassesToSchedule = offering.lab_classes || 0;

    // Parse assigned teachers
    let assignedTeachers;
    try {
      assignedTeachers = Array.isArray(offering.teachers)
        ? offering.teachers
        : JSON.parse(offering.teachers || "[]");
    } catch (error) {
      console.error(`Failed to parse teachers for ${offering.coursename}`, error);
      assignedTeachers = [];
    }

    // Find matching teachers
    const teachersForOffering = assignedTeachers
      .map((assignedTeacher) => teachers.find((t) => t.id === assignedTeacher.id))
      .filter(Boolean);

    if (teachersForOffering.length === 0) {
      console.warn(`Assigned teachers not found for course offering ${offering.coursename}`);
      continue;
    }

    // Parse section data
    let section = offering.sectionData;
    try {
      section = typeof section === "string" ? JSON.parse(section) : section;
    } catch (error) {
      console.error(`Failed to parse section data for ${offering.coursename}`, error);
      continue;
    }

    if (!section || !section.id) { // Ensure 'id' exists
      console.warn(`Invalid section data for course offering ${offering.coursename}`);
      continue;
    }

    // Fetch the actual section record
    const dbSection = await prisma.section.findUnique({
      where: { id: section.id },
    });

    if (!dbSection) {
      console.warn(`Section with id ${section.id} not found for course offering ${offering.coursename}`);
      continue;
    }

    // Determine section's shift
    let sectionShift = dbSection.shift;
    if (!sectionShift) {
      const match = dbSection.sectionDisplay.match(/\((M|E)\)$/);
      sectionShift = match ? match[1] : null;
    }

    // Filter based on the selected shift
    if (shift === 'Morning' && sectionShift !== 'M') continue;
    if (shift === 'Evening' && sectionShift !== 'E') continue;

    // Schedule classes
    await scheduleClasses({
      theoryClassesToSchedule,
      labClassesToSchedule,
      teachersForOffering,
      section: dbSection,
      timeSlots,
      classrooms,
      timetable,
      teacherSectionDayCount,
      offering,
    });
  }

  // Save the generated timetable to the database
  await saveTimetable(timetable);

  return timetable;
}
// Function to schedule classes
async function scheduleClasses({
  theoryClassesToSchedule,
  labClassesToSchedule,
  teachersForOffering,
  section,
  timeSlots,
  classrooms,
  timetable,
  teacherSectionDayCount,
  offering,
}) {
  // Schedule theory classes
  for (let i = 0; i < theoryClassesToSchedule; i++) {
    const classScheduled = await scheduleClass({
      teachersForOffering,
      section,
      timeSlots,
      classrooms,
      timetable,
      teacherSectionDayCount,
      offering,
      classType: 'theory',
      classIndex: i,
    });

    if (!classScheduled) {
      console.warn(`Could not schedule theory class ${i + 1} for ${offering.coursename}`);
    }
  }

  // Schedule lab classes
  for (let i = 0; i < labClassesToSchedule; i++) {
    const classScheduled = await scheduleClass({
      teachersForOffering,
      section,
      timeSlots,
      classrooms,
      timetable,
      teacherSectionDayCount,
      offering,
      classType: 'lab',
      classIndex: i,
    });

    if (!classScheduled) {
      console.warn(`Could not schedule lab class ${i + 1} for ${offering.coursename}`);
    }
  }
}
// Function to schedule a single class
async function scheduleClass({
  teachersForOffering,
  section,
  timeSlots,
  classrooms,
  timetable,
  teacherSectionDayCount,
  offering,
  classType,
  classIndex,
}) {
  for (const day of days) {
    for (const teacher of teachersForOffering) {
      const key = `${teacher.id}-${section.id}-${day}`;
      const classCount = teacherSectionDayCount[key] || 0;
      if (classCount >= 2) continue; // Limit to 2 classes per day per teacher-section

      for (const timeSlot of timeSlots) {
        const availableRoom = findAvailableRoom({
          classrooms,
          timetable,
          section,
          timeSlot,
          day,
          classType,
        });

        if (!availableRoom) {
          console.warn(`No available ${classType} room for ${offering.coursename} on ${day} at ${timeSlot}`);
          continue;
        }

        if (
          !isTeacherAvailable({ timetable, teacher, timeSlot, day }) ||
          !isSectionAvailable({ timetable, section, timeSlot, day })
        ) {
          continue;
        }

        // Schedule the class
        timetable.push({
          courseOfferingId: offering.id,
          teacher: teacher.name,
          roomId: availableRoom.id,
          time: timeSlot,
          day: day,
          sectionId: section.id,
        });

        teacherSectionDayCount[key] = classCount + 1;
        return true; // Class scheduled successfully
      }
    }
  }
  return false; // Class could not be scheduled
}
function findAvailableRoom({ classrooms, timetable, section, timeSlot, day, classType }) {
  return classrooms.find((room) => {
    const isValidRoomType =
      classType === "theory"
        ? [ "Lecture_Theater","Class"].includes(room.type)
        : room.type === "Lab";

    return (
      isValidRoomType &&
      room.totalSpace >= section.studentCount &&
      !timetable.some(
        (entry) => entry.roomId === room.id && entry.time === timeSlot && entry.day === day
      )
    );
  });
}
// Function to check if a teacher is available
function isTeacherAvailable({ timetable, teacher, timeSlot, day }) {
  return !timetable.some(
    (entry) => entry.teacher === teacher.name && entry.time === timeSlot && entry.day === day
  );
}
// Function to check if a section is available
function isSectionAvailable({ timetable, section, timeSlot, day }) {
  return !timetable.some(
    (entry) => entry.sectionId === section.id && entry.time === timeSlot && entry.day === day
  );
}
// Function to save the generated timetable to the database
async function saveTimetable(timetable) {
  try {
    await prisma.timetableentry.createMany({
      data: timetable.map((entry) => {
        const [hours, minutes] = entry.time.split(":").map(Number);
        const startTime = new Date();
        startTime.setHours(hours, minutes, 0, 0);
        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + 60); // Assuming 1-hour classes

        return {
          day: entry.day,
          startTime: startTime,
          endTime: endTime,
          roomId: entry.roomId,
          courseId: entry.courseOfferingId,
          sectionId: entry.sectionId || null,
          teacher: entry.teacher,
        };
      }),
      skipDuplicates: true,
    });
    console.log("Timetable entries saved successfully.");
  } catch (error) {
    console.error("Failed to save timetable entries:", error);
    throw error; // Rethrow to be caught by the route handler
  }
}
// are class complete
async function areClassesComplete(courseId, sectionId, classType) {
  const courseOffering = await prisma.courseoffering.findUnique({
    where: { id: courseId },
  });

  if (!courseOffering) {
    throw new Error("Course offering not found");
  }

  const totalClassesRequired =
    classType === "theory"
      ? courseOffering.theory_classes
      : courseOffering.lab_classes;

  const completedClasses = await prisma.timetableentry.count({
    where: {
      courseId,
      sectionId,
      classType,
    },
  });

  return completedClasses >= totalClassesRequired;
}

// // POST - Generate Timetable
app.post("/generate-timetable", async (req, res) => {
  const { shift, startTime, endTime, classDuration, includeBreak, breakDuration } = req.body;

  // Basic validation
  if (!shift || !startTime || !endTime || !classDuration) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    console.log("Generating timetable with the following parameters:");
    console.log({ shift, startTime, endTime, classDuration, includeBreak, breakDuration });

    const timetable = await generateTimetable({
      shift,
      startTime,
      endTime,
      classDuration,
      includeBreak,
      breakDuration,
    });

    res.json({ message: "Timetable generated successfully", timetable });
  } catch (error) {
    console.error("Failed to generate timetable:", error);
    res.status(500).json({ message: "Failed to generate timetable", error: error.message });
  }
});






//POST NEW empty cell
app.post("/timetable/new", async (req, res) => {
  const { courseId, sectionId, teacher, roomId, day, startTime, endTime, classType } = req.body;

  try {
    // Check if classes are already complete
    const classesComplete = await areClassesComplete(courseId, sectionId, classType);
    if (classesComplete) {
      return res.status(400).json({
        message: `All ${classType} classes for this course and section are already scheduled. Please delete a class first.`,
      });
    }

    // Proceed to add the new timetable entry
    const newEntry = await prisma.timetableentry.create({
      data: {
        courseId,
        sectionId,
        teacher,
        roomId,
        day,
        startTime: new Date(`1970-01-01T${startTime}:00`),
        endTime: new Date(`1970-01-01T${endTime}:00`),
        classType,
      },
    });

    res.json({ message: "Timetable entry created successfully", entry: newEntry });
  } catch (error) {
    console.error("Failed to create timetable entry:", error);
    res.status(500).json({ message: "Failed to create timetable entry", error: error.message });
  }
});

// DELETE - Delete a single timetable entry by ID
app.delete("/timetable/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const existingEntry = await prisma.timetableentry.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingEntry) {
      return res.status(404).json({ message: "Timetable entry not found" });
    }

    await prisma.timetableentry.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: "Timetable entry deleted successfully" });
  } catch (error) {
    console.error("Failed to delete timetable entry:", error);
    res.status(500).json({ message: "Failed to delete timetable entry", error: error.message });
  }
});
// GET - Retrieve all timetable entries
app.get("/timetable", async (req, res) => {
  try {
    const timetableEntries = await prisma.timetableentry.findMany({
      include: {
        courseoffering: true,
        room: true,
        section: true,
      },
    });

    // Format startTime and endTime as "HH:MM"
    const formattedEntries = timetableEntries.map(entry => ({
      ...entry,
      startTime: new Date(entry.startTime).toTimeString().substr(0, 5), // "HH:MM"
      endTime: new Date(entry.endTime).toTimeString().substr(0, 5),     // "HH:MM"
    }));

    // Log the fetched data
    // console.log("Fetched Timetable Entries:", JSON.stringify(formattedEntries, null, 2));

    res.json(formattedEntries);
  } catch (error) {
    console.error("Failed to fetch timetable entries:", error);
    res.status(500).json({ message: "Failed to fetch timetable entries.", error: error.message });
  }
});
// PUT - Update Timetable Entry
app.put('/timetable/:id', async (req, res) => {
  const { id } = req.params;
  const { teacher, roomId, day, startTime, endTime } = req.body;

  try {
    // Validate input
    if (!teacher || !roomId || !day || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if the entry exists
    const existingEntry = await prisma.timetableentry.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        courseoffering: true,
        room: true,
        section: true,
      },
    });

    if (!existingEntry) {
      return res.status(404).json({ message: "Timetable entry not found." });
    }

    // Parse the received startTime and endTime as Date objects
    const startDate = new Date(`1970-01-01T${startTime}:00`);
    const endDate = new Date(`1970-01-01T${endTime}:00`);

    // Validate the constructed dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Invalid startTime or endTime format." });
    }

    // Ensure that startTime is before endTime
    if (startDate >= endDate) {
      return res.status(400).json({ message: "startTime must be before endTime." });
    }

    // Update the entry and include related data
    const updatedEntry = await prisma.timetableentry.update({
      where: { id: parseInt(id, 10) },
      data: {
        teacher,
        roomId: parseInt(roomId, 10),
        day,
        startTime: startDate,
        endTime: endDate,
      },
      include: {
        courseoffering: true,
        room: true,
        section: true,
      },
    });

    // Format startTime and endTime as "HH:MM"
    const formattedEntry = {
      ...updatedEntry,
      startTime: startDate.toTimeString().substr(0, 5), // "HH:MM"
      endTime: endDate.toTimeString().substr(0, 5),     // "HH:MM"
    };

    res.json(formattedEntry);
  } catch (error) {
    console.error("Failed to update timetable entry:", error);
    res.status(500).json({ 
      message: "Failed to update timetable entry.", 
      error: error.message 
    });
  }
});
// DELETE - Delete all timetable entries
app.delete("/timetable", async (req, res) => {
  try {
    // Delete all entries in the timetable
    await prisma.timetableentry.deleteMany();

    res.json({ message: "All timetable entries deleted successfully" });
  } catch (error) {
    console.error("Failed to delete all timetable entries:", error);
    res.status(500).json({ message: "Failed to delete all timetable entries", error: error.message });
  }});

 

// POST endpoint to upload timetable Excel file
app.post("/timetable/upload", upload.single("file"), async (req, res) => {
  try {
    // Path to the uploaded file
    const filePath = req.file.path;
    
    // Read the Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Parse the worksheet into JSON format
    const timetableData = xlsx.utils.sheet_to_json(worksheet);
    console.log("Raw Uploaded Timetable Data:", timetableData);
    
    // Loop through timetable data to process and save each entry
    for (const [index, timetable] of timetableData.entries()) {
      try {
        const { courseOfferingId, teacher, roomId, time, day, sectionId } = timetable;
        
        // Validate required fields
        if (!courseOfferingId || !teacher || !roomId || !time || !day || !sectionId) {
          console.error(`Missing required fields in timetable at row ${index + 2}:`, timetable);
          continue;
        }
        
        // Convert time to Date object
        const [hours, minutes] = time.split(":").map(Number);
        const startTime = new Date();
        startTime.setHours(hours, minutes, 0, 0);
        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + 60); // Assuming 1-hour classes
        
        // Validate course offering exists
        const courseOffering = await prisma.courseOffering.findUnique({
          where: { id: courseOfferingId },
        });
        if (!courseOffering) {
          console.error(`Course offering not found for ID ${courseOfferingId} at row ${index + 2}`);
          continue;
        }
        
        // Validate teacher exists
        const teacherRecord = await prisma.teacher.findFirst({
          where: { name: teacher },
        });
        if (!teacherRecord) {
          console.error(`Teacher not found for name ${teacher} at row ${index + 2}`);
          continue;
        }
        
        // Validate room exists
        const roomRecord = await prisma.room.findUnique({
          where: { id: roomId },
        });
        if (!roomRecord) {
          console.error(`Room not found for ID ${roomId} at row ${index + 2}`);
          continue;
        }
        
        // Validate section exists
        const sectionRecord = await prisma.section.findUnique({
          where: { id: sectionId },
        });
        if (!sectionRecord) {
          console.error(`Section not found for ID ${sectionId} at row ${index + 2}`);
          continue;
        }
        
        // Save timetable entry to the database
        await prisma.timetableEntry.create({
          data: {
            courseId: courseOfferingId,
            teacher: teacherRecord.name,
            roomId: roomRecord.id,
            startTime: startTime,
            endTime: endTime,
            day: day,
            sectionId: sectionRecord.id,
          },
        });

        console.log(`Uploaded timetable entry for course: ${courseOffering.coursename} at row ${index + 2}`);
      } catch (error) {
        console.error(`Error processing timetable at row ${index + 2}:`, timetable, error);
        continue;
      }
    }

    // Delete the uploaded file after processing
    fs.unlinkSync(filePath);

    // Send a success response
    res.json({ message: "Timetable uploaded successfully" });
  } catch (error) {
    console.error("Error uploading timetable:", error);
    res.status(500).json({ message: "Failed to upload timetable", error: error.message });
  }
});


// app.post('/register', async (req, res) => {
//   const {
//     name,
//     cnic,
//     aridno,
//     degree,
//     shift,
//     semester,
//     section,
//     courses,
//     classes_info,
//     email,
//     role,
//     teachersNo
//   } = req.body;

//   if(!role || !['student','teacher'].includes(role)){
//     return res.status(400).json({error:'Invalid or missing role'});
//   }
  
//   if (role === 'student' && (!aridno || !semester || !section || !shift || !email || !name || !cnic)) {
//     return res.status(400).json({ error: 'Missing student fields' });
//   }
  
//   // Fix: Added negation (!) to teachersNo to check if it's missing
//   if (role === 'teacher' && (!name || !email || !cnic || !teachersNo)) {
//     return res.status(400).json({ error: 'Missing teacher fields' });
//   }

//   try {
//     const whereCondition = {
//       OR: [
//         {email},
//         ...(role === 'student' && aridno ? [{aridno}] : []),
//         ...(role === 'teacher' && teachersNo ? [{teachersNo}] : [])
//       ]
//     };

//     const existingUser = await prisma.user.findFirst({where: whereCondition});
    
//     if (existingUser) {
//       let errorMessage = 'User with this email already exists';
//       if (role === 'student' && existingUser.aridno === aridno) {
//         errorMessage = 'User with this Arid No already exists';
//       } else if (role === 'teacher' && existingUser.teachersNo === teachersNo) {
//         errorMessage = 'User with this Teacher ID already exists';
//       }
//       return res.status(409).json({ error: errorMessage });
//     }
    
//     // Create user with role-specific fields
//     const userData = {
//       name,
//       cnic,
//       email,
//       role,
//       // Add role-specific fields conditionally
//       ...(role === 'student' ? {
//         aridno,
//         degree,
//         shift,
//         semester,
//         section,
//         courses,
//         classes_info
//       } : {}),
//       ...(role === 'teacher' ? {
//         teachersNo
//       } : {})
//     };
    
//     const newUser = await prisma.user.create({ data: userData });
    
//     res.status(201).json({ message: 'Registration successful', user: newUser });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// app.post('/login', async (req, res) => {
//   const { email, cnic } = req.body;

//   if (!email || !cnic) {
//     return res.status(400).json({ error: 'Email and CNIC are required' });
//   }

//   try {
//     const user = await prisma.user.findFirst({
//       where: { email, cnic }
//     });

//     if (!user) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     // Generate JWT Token
//     const token = jwt.sign(
//       { id: user.id, role: user.role, email: user.email },
//       'your_secret_key',  // Change this to a strong secret key
//       { expiresIn: '2h' }
//     );

//     res.json({
//       message: 'Login successful',
//       user: {
//         id: user.id,
//         name: user.name,
//         role: user.role,
//         email: user.email
//       },
//       token
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });



// Register endpoint (unchanged)
app.post('/register', validateRegisterInput, async (req, res) => {
  const {
    name,
    cnic,
    aridno,
    degree,
    shift,
    semester,
    section,
    courses,
    classes_info,
    email,
    role,
    teachersNo
  } = req.body;

  try {
    const whereCondition = {
      OR: [
        { email },
        ...(role === 'student' && aridno ? [{ aridno }] : []),
        ...(role === 'teacher' && teachersNo ? [{ teachersNo }] : [])
      ]
    };

    const existingUser = await prisma.user.findFirst({ where: whereCondition });

    if (existingUser) {
      let errorMessage = 'User with this email already exists';
      if (role === 'student' && existingUser.aridno === aridno) {
        errorMessage = 'User with this Arid No already exists';
      } else if (role === 'teacher' && existingUser.teachersNo === teachersNo) {
        errorMessage = 'User with this Teacher ID already exists';
      }
      return res.status(409).json({ error: errorMessage });
    }

    // Create user with role-specific fields
    const userData = {
      name,
      cnic,
      email,
      role,
      ...(role === 'student' ? {
        aridno,
        degree,
        shift,
        semester,
        section,
        courses,
        classes_info
      } : {}),
      ...(role === 'teacher' ? {
        teachersNo
      } : {})
    };

    const newUser = await prisma.user.create({ data: userData });

    res.status(201).json({ message: 'Registration successful', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login endpoint (updated to include teachersNo)
app.post('/login', validateLoginInput, async (req, res) => {
  const { email, cnic } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: { email, cnic },
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
        section: true, // For students
        teachersNo: true // For teachers
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        section: user.section, // Included for students, null for teachers
        teachersNo: user.teachersNo // Included for teachers, null for students
      },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get user data endpoint (unchanged)
app.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        section: true,
        teachersNo: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/student',async(req,res)=>{
  try{

    const students=await prisma.user.findMany({
      where:{role:'student'},
      select:{
        id:true,
        name:true,
        email:true,
        cnic:true,
        aridno:true,
        semester:true,
        shift:true,
        section:true,
      }
    });
    res.json(students);
  }catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

//update student 
// Update student endpoint
app.put('/student/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, cnic, aridno, semester, shift, section } = req.body;

  try {
    // Log incoming request data for debugging
    console.log('Request body:', req.body);
    console.log('ID:', id);

    // Validate input
    if (!name || !email || !cnic || !aridno || !semester || !shift || !section) {
      console.log('Missing fields:', { name, email, cnic, aridno, semester, shift, section });
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate ID
    if (isNaN(parseInt(id))) {
      console.log('Invalid ID:', id);
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { role: true },
    });

    if (!student || student.role !== 'student') {
      console.log('Student not found or not a student:', id);
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check for conflicts (duplicate email or aridno, excluding current student)
    console.log('Checking for conflicts with email:', email, 'aridno:', aridno);
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email || '' }, // Handle null/undefined email
          { aridno: aridno || '' }, // Handle null/undefined aridno
        ],
        NOT: { id: parseInt(id) },
      },
    });

    console.log('Existing user:', existingUser);

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ error: 'Email already in use' });
      }
      if (existingUser.aridno === aridno) {
        return res.status(409).json({ error: 'Arid No already in use' });
      }
    }

    // Update student
    const updatedStudent = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        cnic,
        aridno,
        semester,
        shift,
        section,
      },
      select: {
        id: true,
        name: true,
        email: true,
        cnic: true,
        aridno: true,
        semester: true,
        shift: true,
        section: true,
      },
    });

    res.json({ message: 'Student updated successfully', student: updatedStudent });
  } catch (err) {
    console.error('Error in PUT /student/:id:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





// // Middleware to validate message input
// const validateMessageInput = (req, res, next) => {
//   const { receiverId, message, receiverType } = req.body;
//   if (!receiverId || !message || !receiverType) {
//     return res.status(400).json({ error: 'Receiver ID, message, and receiver type are required' });
//   }
//   if (typeof message !== 'string' || message.trim().length === 0) {
//     return res.status(400).json({ error: 'Message must be a non-empty string' });
//   }
//   if (!['student', 'teacher', 'admin'].includes(receiverType)) {
//     return res.status(400).json({ error: 'Invalid receiver type' });
//   }
//   next();
// };

// // Middleware to enforce communication rules
// const enforceCommunicationRules = async (req, res, next) => {
//   const { user } = req; // From authenticateToken
  
//   // Handle both POST and GET requests
//   const receiverId = req.body.receiverId || req.query.receiverId;
//   const receiverType = req.body.receiverType || req.query.receiverType;
  
//   if (!receiverId || !receiverType) {
//     return res.status(400).json({ error: 'Receiver ID and receiver type are required' });
//   }

//   try {
//     // Verify receiver exists
//     const receiver = await prisma.user.findUnique({
//       where: { id: parseInt(receiverId) },
//       select: { id: true, role: true },
//     });

//     if (!receiver) {
//       return res.status(404).json({ error: 'Receiver not found' });
//     }

//     if (receiver.role !== receiverType) {
//       return res.status(400).json({ error: 'Receiver type mismatch' });
//     }

//     // Modified communication rules to allow student-teacher and teacher-student communication
//     if (user.role === 'student' && receiverType !== 'teacher') {
//       return res.status(403).json({ error: 'Students can only communicate with teachers' });
//     }
    
//     if (user.role === 'teacher' && !['student', 'admin'].includes(receiverType)) {
//       return res.status(403).json({ error: 'Teachers can only communicate with students or admins' });
//     }
    
//     if (user.role === 'admin' && receiverType !== 'teacher') {
//       return res.status(403).json({ error: 'Admins can only communicate with teachers' });
//     }

//     next();
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// // GET /admins - Fetch all admins (for teachers)
// app.get('/admins', authenticateToken, async (req, res) => {
//   if (req.user.role !== 'teacher') {
//     return res.status(403).json({ error: 'Only teachers can fetch admins' });
//   }
//   try {
//     const admins = await prisma.user.findMany({
//       where: { role: 'admin' },
//       select: { id: true, name: true },
//     });
//     res.json(admins);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // GET /teachers - Fetch all teachers (for admins and students)
// app.get('/teachers', authenticateToken, async (req, res) => {
//   if (!['admin', 'student'].includes(req.user.role)) {
//     return res.status(403).json({ error: 'Only admins and students can fetch teachers' });
//   }
//   try {
//     const teachers = await prisma.user.findMany({
//       where: { role: 'teacher' },
//       select: { id: true, name: true, teachersNo: true },
//     });
//     res.json(teachers);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // GET /students - Fetch all students (for teachers)
// app.get('/students', authenticateToken, async (req, res) => {
//   if (req.user.role !== 'teacher') {
//     return res.status(403).json({ error: 'Only teachers can fetch students' });
//   }
//   try {
//     const students = await prisma.user.findMany({
//       where: { role: 'student' },
//       select: { id: true, name: true, aridno: true, section: true },
//     });
//     res.json(students);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // GET /messages - Fetch messages between sender and receiver
// app.get('/messages', authenticateToken, enforceCommunicationRules, async (req, res) => {
//   const { receiverId } = req.query;
//   const senderId = req.user.id;
//   const senderType = req.user.role;
//   const receiverType = req.query.receiverType;

//   if (!receiverId || !receiverType) {
//     return res.status(400).json({ error: 'Receiver ID and receiver type are required' });
//   }

//   try {
//     const messages = await prisma.message.findMany({
//       where: {
//         OR: [
//           {
//             senderId: parseInt(senderId),
//             receiverId: parseInt(receiverId),
//             senderType,
//             receiverType,
//           },
//           {
//             senderId: parseInt(receiverId),
//             receiverId: parseInt(senderId),
//             senderType: receiverType,
//             receiverType: senderType,
//           },
//         ],
//       },
//       orderBy: { timestamp: 'asc' },
//     });
//     res.json(messages);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // POST /messages/send - Send a message
// app.post('/messages/send', authenticateToken, validateMessageInput, enforceCommunicationRules, async (req, res) => {
//   const { receiverId, message, receiverType } = req.body;
//   const { id: senderId, role: senderType } = req.user;

//   try {
//     const newMessage = await prisma.message.create({
//       data: {
//         senderId,
//         receiverId: parseInt(receiverId),
//         senderType,
//         receiverType,
//         message: message.trim(),
//         timestamp: new Date(),
//       },
//     });
//     res.status(201).json({ message: 'Message sent successfully', data: newMessage });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // GET /conversations - Get list of users that the current user has chatted with
// app.get('/conversations', authenticateToken, async (req, res) => {
//   const userId = req.user.id;
//   const userRole = req.user.role;
  
//   try {
//     // Find all messages where current user is sender or receiver
//     const messages = await prisma.message.findMany({
//       where: {
//         OR: [
//           { senderId: userId },
//           { receiverId: userId }
//         ]
//       },
//       orderBy: { timestamp: 'desc' },
//     });
    
//     // Extract unique conversation partners
//     const conversations = new Map();
    
//     for (const msg of messages) {
//       let partnerId, partnerType;
      
//       if (msg.senderId === userId) {
//         partnerId = msg.receiverId;
//         partnerType = msg.receiverType;
//       } else {
//         partnerId = msg.senderId;
//         partnerType = msg.senderType;
//       }
      
//       // Only add if not already in the map
//       if (!conversations.has(partnerId)) {
//         // Get user details
//         const partner = await prisma.user.findUnique({
//           where: { id: partnerId },
//           select: { id: true, name: true, role: true, aridno: true, teachersNo: true }
//         });
        
//         if (partner) {
//           conversations.set(partnerId, {
//             id: partner.id,
//             name: partner.name,
//             role: partner.role,
//             lastMessage: msg.message,
//             timestamp: msg.timestamp,
//             aridno: partner.aridno,
//             teachersNo: partner.teachersNo
//           });
//         }
//       }
//     }
    
//     res.json(Array.from(conversations.values()));
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });





// // Middleware to check if user is a teacher
// const requireTeacher = (req, res, next) => {
//   if (req.user.role !== 'teacher') {
//     return res.status(403).json({ error: 'Access denied. Teachers only.' });
//   }
//   next();
// };

// POST - Cancel a class (Teachers only)
app.post("/cancel-class", authenticateToken, requireTeacher, async (req, res) => {
  const { timetableId, reason } = req.body;
  const teacherId = req.user.id;

  // Validation
  if (!timetableId) {
    return res.status(400).json({ error: "Timetable ID is required" });
  }

  try {
    // Check if the timetable entry exists
    const timetableEntry = await prisma.timetableentry.findFirst({
      where: {
        id: timetableId,
      },
      include: {
        courseoffering: true,
        room: true,
        section: true,
      }
    });

    if (!timetableEntry) {
      return res.status(404).json({ error: "Timetable entry not found" });
    }

    // Get teacher information to verify ownership
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: { name: true, teachersNo: true }
    });

    if (!teacher) {
      return res.status(403).json({ 
        error: "Teacher not found for ID: " + teacherId 
      });
    }
    
    // Get the teacher record from the teacher table to match with timetable entry
    const teacherRecord = await prisma.teacher.findUnique({
      where: { teacherid: teacher.teachersNo?.toString() }
    });
    
    if (!teacherRecord) {
      return res.status(403).json({
        error: "Teacher record not found for teacher number: " + teacher.teachersNo
      });
    }
    
    // Check if the teacher in the timetable entry matches the authenticated teacher
    // Compare using the teacher's name from the teacher record
    if (timetableEntry.teacher !== teacherRecord.name) {
      return res.status(403).json({ 
        error: `You can only cancel your own classes. Timetable teacher: '${timetableEntry.teacher}', Your name: '${teacherRecord.name}'` 
      });
    }

    // Check if class is already cancelled
    const existingCancellation = await prisma.classCancellation.findFirst({
      where: { timetableId: timetableId }
    });

    if (existingCancellation) {
      return res.status(400).json({ 
        error: "This class is already cancelled",
        cancellation: existingCancellation
      });
    }

    // Create the cancellation record
    const cancellation = await prisma.classCancellation.create({
      data: {
        timetableId: timetableId,
        teacherId: teacherId,
        reason: reason || "No reason provided"
      },
      include: {
        timetableentry: {
          include: {
            courseoffering: true,
            room: true,
            section: true
          }
        }
      }
    });

    res.json({
      message: "Class cancelled successfully",
      cancellation: cancellation
    });

  } catch (error) {
    console.error("Failed to cancel class:", error);
    res.status(500).json({ 
      error: "Failed to cancel class", 
      details: error.message 
    });
  }
});
// PUT - Update class cancellation (Teachers only)
app.put("/cancel-class/:cancellationId", authenticateToken, requireTeacher, async (req, res) => {
  const { cancellationId } = req.params;
  const { reason } = req.body;
  const teacherId = req.user.id;

  try {
    // Check if cancellation exists and belongs to the teacher
    const existingCancellation = await prisma.classCancellation.findFirst({
      where: {
        id: parseInt(cancellationId),
        teacherId: teacherId
      }
    });

    if (!existingCancellation) {
      return res.status(404).json({ 
        error: "Cancellation not found or you don't have permission to update it" 
      });
    }

    // Update the cancellation
    const updatedCancellation = await prisma.classCancellation.update({
      where: { id: parseInt(cancellationId) },
      data: {
        reason: reason || existingCancellation.reason
      },
      include: {
        timetableentry: {
          include: {
            courseoffering: true,
            room: true,
            section: true
          }
        }
      }
    });

    res.json({
      message: "Cancellation updated successfully",
      cancellation: updatedCancellation
    });

  } catch (error) {
    console.error("Failed to update cancellation:", error);
    res.status(500).json({ 
      error: "Failed to update cancellation", 
      details: error.message 
    });
  }
});

// DELETE - Remove class cancellation (Reactivate class)
app.delete("/cancel-class/:cancellationId", authenticateToken, requireTeacher, async (req, res) => {
  const { cancellationId } = req.params;
  const teacherId = req.user.id;

  try {
    // Check if cancellation exists and belongs to the teacher
    const existingCancellation = await prisma.classCancellation.findFirst({
      where: {
        id: parseInt(cancellationId),
        teacherId: teacherId
      }
    });

    if (!existingCancellation) {
      return res.status(404).json({ 
        error: "Cancellation not found or you don't have permission to remove it" 
      });
    }

    // Delete the cancellation (reactivate the class)
    await prisma.classCancellation.delete({
      where: { id: parseInt(cancellationId) }
    });

    res.json({
      message: "Class reactivated successfully (cancellation removed)"
    });

  } catch (error) {
    console.error("Failed to remove cancellation:", error);
    res.status(500).json({ 
      error: "Failed to remove cancellation", 
      details: error.message 
    });
  }
});

// GET - View teacher's cancelled classes
app.get("/my-cancelled-classes", authenticateToken, requireTeacher, async (req, res) => {
  const teacherId = req.user.id;

  try {
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: { name: true }
    });

    const cancelledClasses = await prisma.classCancellation.findMany({
      where: { teacherId: teacherId },
      include: {
        timetableentry: {
          include: {
            courseoffering: true,
            room: true,
            section: true
          }
        }
      },
      orderBy: { cancelledAt: 'desc' }
    });

    res.json({
      teacherName: teacher.name,
      cancelledClasses: cancelledClasses
    });

  } catch (error) {
    console.error("Failed to fetch cancelled classes:", error);
    res.status(500).json({ 
      error: "Failed to fetch cancelled classes", 
      details: error.message 
    });
  }
});

// GET - View timetable with cancellation status (Updated)
app.get("/timetable-with-cancellations", async (req, res) => {
  const { section, teacher } = req.query;
  
  try {
    let whereClause = {};
    
    // Filter by section if provided
    if (section) {
      whereClause.section = {
        sectionDisplay: section
      };
    }
    
    // Filter by teacher if provided
    if (teacher) {
      whereClause.teacher = teacher;
    }

    const timetableEntries = await prisma.timetableentry.findMany({
      where: whereClause,
      include: {
        courseoffering: true,
        room: true,
        section: true,
        cancellations: {
          include: {
            teacher: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: [
        { day: 'asc' },
        { startTime: 'asc' }
      ]
    });

    // Format the response with cancellation and rescheduling status
    // First, get all rescheduled entries for reference
    const rescheduledEntries = await prisma.classReschedule.findMany({
      include: {
        originalTimetableEntry: true,
        newTimetableEntry: true
      }
    });
    
    // Create lookup maps for quick reference
    const originalToRescheduled = new Map();
    const rescheduledEntryIds = new Set();
    
    rescheduledEntries.forEach(reschedule => {
      originalToRescheduled.set(reschedule.originalTimetableId, reschedule);
      rescheduledEntryIds.add(reschedule.newTimetableId);
    });
    
    const formattedEntries = timetableEntries.map(entry => {
      // Check if this entry is a rescheduled class
      const isRescheduled = rescheduledEntryIds.has(entry.id);
      // Check if this entry has been rescheduled to another time
      const hasBeenRescheduled = originalToRescheduled.has(entry.id);
      
      // Get rescheduling info if available
      let rescheduledInfo = null;
      if (isRescheduled) {
        // Find which reschedule this entry belongs to
        const rescheduleEntry = rescheduledEntries.find(r => r.newTimetableId === entry.id);
        if (rescheduleEntry) {
          rescheduledInfo = {
            originalDay: rescheduleEntry.originalTimetableEntry.day,
            originalStartTime: new Date(rescheduleEntry.originalTimetableEntry.startTime).toTimeString().substr(0, 5),
            originalEndTime: new Date(rescheduleEntry.originalTimetableEntry.endTime).toTimeString().substr(0, 5),
            rescheduledAt: rescheduleEntry.rescheduledAt,
            rescheduledBy: rescheduleEntry.rescheduledBy
          };
        }
      } else if (hasBeenRescheduled) {
        const rescheduleEntry = originalToRescheduled.get(entry.id);
        rescheduledInfo = {
          newDay: rescheduleEntry.newTimetableEntry.day,
          newStartTime: new Date(rescheduleEntry.newTimetableEntry.startTime).toTimeString().substr(0, 5),
          newEndTime: new Date(rescheduleEntry.newTimetableEntry.endTime).toTimeString().substr(0, 5),
          rescheduledAt: rescheduleEntry.rescheduledAt,
          rescheduledBy: rescheduleEntry.rescheduledBy
        };
      }
      
      return {
        ...entry,
        startTime: new Date(entry.startTime).toTimeString().substr(0, 5),
        endTime: new Date(entry.endTime).toTimeString().substr(0, 5),
        isCancelled: entry.cancellations.length > 0,
        isRescheduled: isRescheduled,
        hasBeenRescheduled: hasBeenRescheduled,
        classStatus: isRescheduled ? 'rescheduled' : (entry.cancellations.length > 0 ? 'cancelled' : 'regular'),
        statusColor: isRescheduled ? '#FFA500' : (entry.cancellations.length > 0 ? '#FF0000' : '#4CAF50'), // Orange for rescheduled, Red for cancelled, Green for regular
        cancellationInfo: entry.cancellations.length > 0 ? {
          reason: entry.cancellations[0].reason,
          cancelledAt: entry.cancellations[0].cancelledAt,
          cancelledBy: entry.cancellations[0].teacher.name
        } : null,
        rescheduledInfo: rescheduledInfo
      };
    });

    res.json(formattedEntries);

  } catch (error) {
    console.error("Failed to fetch timetable with cancellations:", error);
    res.status(500).json({ 
      error: "Failed to fetch timetable", 
      details: error.message 
    });
  }
});

// GET - Student view: Get cancelled and rescheduled classes for their section
app.get("/cancelled-classes", authenticateToken, async (req, res) => {
  try {
    let whereClause = {};
    
    // If user is a student, filter by their section
    if (req.user.role === 'student') {
      const student = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { section: true }
      });
      
      if (student && student.section) {
        whereClause = {
          timetableentry: {
            section: {
              sectionDisplay: student.section
            }
          }
        };
      }
    }

    const cancelledClasses = await prisma.classCancellation.findMany({
      where: whereClause,
      include: {
        timetableentry: {
          include: {
            courseoffering: true,
            room: true,
            section: true
          }
        },
        teacher: {
          select: { name: true }
        }
      },
      orderBy: { cancelledAt: 'desc' }
    });

    // Get rescheduled classes for the section as well
    let rescheduledWhereClause = {};
    if (req.user.role === 'student') {
      const student = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { section: true }
      });
      
      if (student && student.section) {
        rescheduledWhereClause = {
          newTimetableEntry: {
            section: {
              sectionDisplay: student.section
            }
          }
        };
      }
    }
    
    const rescheduledClasses = await prisma.classReschedule.findMany({
      where: rescheduledWhereClause,
      include: {
        cancellation: {
          include: {
            timetableentry: {
              include: {
                courseoffering: true,
                room: true,
                section: true
              }
            }
          }
        },
        newTimetableEntry: {
          include: {
            courseoffering: true,
            room: true,
            section: true
          }
        },
        teacher: {
          select: { name: true }
        }
      },
      orderBy: { rescheduledAt: 'desc' }
    });

    // Format the response
    const formattedCancellations = cancelledClasses.map(cancellation => ({
      id: cancellation.id,
      reason: cancellation.reason,
      cancelledAt: cancellation.cancelledAt,
      cancelledBy: cancellation.teacher.name,
      status: 'cancelled',
      statusColor: '#FF0000', // Red for cancelled
      classDetails: {
        day: cancellation.timetableentry.day,
        startTime: new Date(cancellation.timetableentry.startTime).toTimeString().substr(0, 5),
        endTime: new Date(cancellation.timetableentry.endTime).toTimeString().substr(0, 5),
        course: cancellation.timetableentry.courseoffering?.coursename,
        room: cancellation.timetableentry.room?.roomNumber,
        section: cancellation.timetableentry.section?.sectionDisplay
      }
    }));
    
    // Format rescheduled classes
    const formattedReschedules = rescheduledClasses.map(reschedule => ({
      id: reschedule.id,
      rescheduledAt: reschedule.rescheduledAt,
      rescheduledBy: reschedule.rescheduledBy || reschedule.teacher.name,
      status: 'rescheduled',
      statusColor: '#FFA500', // Orange for rescheduled
      originalClassDetails: {
        day: reschedule.cancellation.timetableentry.day,
        startTime: new Date(reschedule.cancellation.timetableentry.startTime).toTimeString().substr(0, 5),
        endTime: new Date(reschedule.cancellation.timetableentry.endTime).toTimeString().substr(0, 5),
        course: reschedule.cancellation.timetableentry.courseoffering?.coursename,
        room: reschedule.cancellation.timetableentry.room?.roomNumber,
        section: reschedule.cancellation.timetableentry.section?.sectionDisplay
      },
      newClassDetails: {
        day: reschedule.newTimetableEntry.day,
        startTime: new Date(reschedule.newTimetableEntry.startTime).toTimeString().substr(0, 5),
        endTime: new Date(reschedule.newTimetableEntry.endTime).toTimeString().substr(0, 5),
        course: reschedule.newTimetableEntry.courseoffering?.coursename,
        room: reschedule.newTimetableEntry.room?.roomNumber,
        section: reschedule.newTimetableEntry.section?.sectionDisplay
      },
      reason: reschedule.cancellation.reason
    }));

    res.json({
      cancelledClasses: formattedCancellations,
      rescheduledClasses: formattedReschedules
    });

  } catch (error) {
    console.error("Failed to fetch cancelled classes:", error);
    res.status(500).json({ 
      error: "Failed to fetch cancelled classes", 
      details: error.message 
    });
  }
});


// POST - Reschedule a cancelled class (Teachers only)
app.post("/reschedule-class", authenticateToken, requireTeacher, async (req, res) => {
  const { cancellationId, newDay, newStartTime, newEndTime, newRoomId } = req.body;
  const teacherId = req.user.id;

  // Validation
  if (!cancellationId || !newDay || !newStartTime || !newEndTime) {
    return res.status(400).json({ 
      error: "Cancellation ID, new day, start time, and end time are required" 
    });
  }

  try {
    // Check if the cancellation exists and belongs to the teacher
    const cancellation = await prisma.classCancellation.findFirst({
      where: {
        id: parseInt(cancellationId),
        teacherId: teacherId
      },
      include: {
        timetableentry: {
          include: {
            courseoffering: true,
            room: true,
            section: true
          }
        }
      }
    });

    if (!cancellation) {
      return res.status(404).json({ 
        error: "Cancellation not found or you don't have permission to reschedule it" 
      });
    }

    // Check if this cancellation is already rescheduled
    const existingReschedule = await prisma.classReschedule.findFirst({
      where: { cancellationId: parseInt(cancellationId) }
    });

    if (existingReschedule) {
      return res.status(400).json({ 
        error: "This cancelled class is already rescheduled",
        reschedule: existingReschedule
      });
    }

    const originalEntry = cancellation.timetableentry;

    // Parse new times
    const [startHours, startMinutes] = newStartTime.split(':').map(Number);
    const [endHours, endMinutes] = newEndTime.split(':').map(Number);
    
    const newStartTimeObj = new Date();
    newStartTimeObj.setHours(startHours, startMinutes, 0, 0);
    
    const newEndTimeObj = new Date();
    newEndTimeObj.setHours(endHours, endMinutes, 0, 0);

    // Validate time logic
    if (newStartTimeObj >= newEndTimeObj) {
      return res.status(400).json({ 
        error: "Start time must be before end time" 
      });
    }

    let roomToUse = originalEntry.roomId;
    
    // If new room is specified, validate it exists
    if (newRoomId) {
      const newRoom = await prisma.room.findUnique({
        where: { id: parseInt(newRoomId) }
      });
      
      if (!newRoom) {
        return res.status(400).json({ error: "Specified room not found" });
      }
      
      // Check room capacity
      if (newRoom.totalSpace < originalEntry.section.studentCount) {
        return res.status(400).json({ 
          error: "Room capacity is insufficient for this section" 
        });
      }
      
      roomToUse = parseInt(newRoomId);
    }

    // Check if teacher is available at the new time
    const teacherConflict = await prisma.timetableentry.findFirst({
      where: {
        teacher: originalEntry.teacher,
        day: newDay,
        OR: [
          {
            AND: [
              { startTime: { lte: newStartTimeObj } },
              { endTime: { gt: newStartTimeObj } }
            ]
          },
          {
            AND: [
              { startTime: { lt: newEndTimeObj } },
              { endTime: { gte: newEndTimeObj } }
            ]
          },
          {
            AND: [
              { startTime: { gte: newStartTimeObj } },
              { endTime: { lte: newEndTimeObj } }
            ]
          }
        ]
      }
    });

    if (teacherConflict) {
      return res.status(409).json({ 
        error: "Teacher is not available at the specified time",
        conflict: teacherConflict
      });
    }

    // Check if section is available at the new time
    const sectionConflict = await prisma.timetableentry.findFirst({
      where: {
        sectionId: originalEntry.sectionId,
        day: newDay,
        OR: [
          {
            AND: [
              { startTime: { lte: newStartTimeObj } },
              { endTime: { gt: newStartTimeObj } }
            ]
          },
          {
            AND: [
              { startTime: { lt: newEndTimeObj } },
              { endTime: { gte: newEndTimeObj } }
            ]
          },
          {
            AND: [
              { startTime: { gte: newStartTimeObj } },
              { endTime: { lte: newEndTimeObj } }
            ]
          }
        ]
      }
    });

    if (sectionConflict) {
      return res.status(409).json({ 
        error: "Section has another class at the specified time",
        conflict: sectionConflict
      });
    }

    // Check if room is available at the new time
    const roomConflict = await prisma.timetableentry.findFirst({
      where: {
        roomId: roomToUse,
        day: newDay,
        OR: [
          {
            AND: [
              { startTime: { lte: newStartTimeObj } },
              { endTime: { gt: newStartTimeObj } }
            ]
          },
          {
            AND: [
              { startTime: { lt: newEndTimeObj } },
              { endTime: { gte: newEndTimeObj } }
            ]
          },
          {
            AND: [
              { startTime: { gte: newStartTimeObj } },
              { endTime: { lte: newEndTimeObj } }
            ]
          }
        ]
      }
    });

    if (roomConflict) {
      return res.status(409).json({ 
        error: "Room is not available at the specified time",
        conflict: roomConflict
      });
    }

    // Create a new timetable entry for the rescheduled class
    const newTimetableEntry = await prisma.timetableentry.create({
      data: {
        day: newDay,
        startTime: newStartTimeObj,
        endTime: newEndTimeObj,
        roomId: roomToUse,
        courseId: originalEntry.courseId,
        sectionId: originalEntry.sectionId,
        teacher: originalEntry.teacher,
        isRescheduled: true, // Add this field to track rescheduled classes
        rescheduleColor: '#FFA500' // Orange color for rescheduled classes
      },
      include: {
        courseoffering: true,
        room: true,
        section: true
      }
    });

    // Create the reschedule record
    const reschedule = await prisma.classReschedule.create({
      data: {
        cancellationId: parseInt(cancellationId),
        originalTimetableId: originalEntry.id,
        newTimetableId: newTimetableEntry.id,
        teacherId: teacherId,
        rescheduledBy: req.user.name || "Unknown"
      },
      include: {
        cancellation: {
          include: {
            timetableentry: {
              include: {
                courseoffering: true,
                room: true,
                section: true
              }
            }
          }
        },
        newTimetableEntry: {
          include: {
            courseoffering: true,
            room: true,
            section: true
          }
        }
      }
    });

    res.json({
      message: "Class rescheduled successfully",
      reschedule: reschedule,
      newTimetableEntry: newTimetableEntry
    });

  } catch (error) {
    console.error("Failed to reschedule class:", error);
    res.status(500).json({ 
      error: "Failed to reschedule class", 
      details: error.message 
    });
  }
});

// GET - Get available time slots for rescheduling
app.get("/available-slots/:cancellationId", authenticateToken, requireTeacher, async (req, res) => {
  const { cancellationId } = req.params;
  const { day, duration } = req.query; // Optional filters
  const teacherId = req.user.id;

  try {
    // Verify cancellation belongs to teacher
    const cancellation = await prisma.classCancellation.findFirst({
      where: {
        id: parseInt(cancellationId),
        teacherId: teacherId
      },
      include: {
        timetableentry: {
          include: {
            courseoffering: true,
            room: true,
            section: true
          }
        }
      }
    });

    if (!cancellation) {
      return res.status(404).json({ 
        error: "Cancellation not found or you don't have permission" 
      });
    }

    const originalEntry = cancellation.timetableentry;
    const classDuration = duration ? parseInt(duration) : 60; // Default 60 minutes

    // Get all possible time slots (you can customize this based on your institution's schedule)
    const timeSlots = [
      "08:00", "09:00", "10:00", "11:00", "12:00", 
      "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
    ];

    const daysToCheck = day ? [day] : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const availableSlots = [];

    for (const checkDay of daysToCheck) {
      for (const timeSlot of timeSlots) {
        const [hours, minutes] = timeSlot.split(':').map(Number);
        const startTime = new Date();
        startTime.setHours(hours, minutes, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + classDuration);

        // Check teacher availability
        const teacherBusy = await prisma.timetableentry.findFirst({
          where: {
            teacher: originalEntry.teacher,
            day: checkDay,
            OR: [
              {
                AND: [
                  { startTime: { lte: startTime } },
                  { endTime: { gt: startTime } }
                ]
              },
              {
                AND: [
                  { startTime: { lt: endTime } },
                  { endTime: { gte: endTime } }
                ]
              }
            ]
          }
        });

        // Check section availability
        const sectionBusy = await prisma.timetableentry.findFirst({
          where: {
            sectionId: originalEntry.sectionId,
            day: checkDay,
            OR: [
              {
                AND: [
                  { startTime: { lte: startTime } },
                  { endTime: { gt: startTime } }
                ]
              },
              {
                AND: [
                  { startTime: { lt: endTime } },
                  { endTime: { gte: endTime } }
                ]
              }
            ]
          }
        });

        // Get available rooms
        const availableRooms = await prisma.room.findMany({
          where: {
            totalSpace: { gte: originalEntry.section.studentCount },
            NOT: {
              timetableentries: {
                some: {
                  day: checkDay,
                  OR: [
                    {
                      AND: [
                        { startTime: { lte: startTime } },
                        { endTime: { gt: startTime } }
                      ]
                    },
                    {
                      AND: [
                        { startTime: { lt: endTime } },
                        { endTime: { gte: endTime } }
                      ]
                    }
                  ]
                }
              }
            }
          }
        });

        if (!teacherBusy && !sectionBusy && availableRooms.length > 0) {
          availableSlots.push({
            day: checkDay,
            startTime: timeSlot,
            endTime: endTime.toTimeString().substr(0, 5),
            availableRooms: availableRooms.map(room => ({
              id: room.id,
              roomNumber: room.roomNumber,
              type: room.type,
              capacity: room.totalSpace
            }))
          });
        }
      }
    }

    res.json({
      originalClass: {
        course: originalEntry.courseoffering.coursename,
        section: originalEntry.section.sectionDisplay,
        originalDay: originalEntry.day,
        originalTime: `${originalEntry.startTime.toTimeString().substr(0, 5)} - ${originalEntry.endTime.toTimeString().substr(0, 5)}`
      },
      availableSlots: availableSlots
    });

  } catch (error) {
    console.error("Failed to get available slots:", error);
    res.status(500).json({ 
      error: "Failed to get available slots", 
      details: error.message 
    });
  }
});

// PUT - Update reschedule (modify rescheduled time)
app.put("/reschedule-class/:rescheduleId", authenticateToken, requireTeacher, async (req, res) => {
  const { rescheduleId } = req.params;
  const { newDay, newStartTime, newEndTime, newRoomId } = req.body;
  const teacherId = req.user.id;

  try {
    // Find the reschedule record
    const reschedule = await prisma.classReschedule.findFirst({
      where: {
        id: parseInt(rescheduleId),
        teacherId: teacherId
      },
      include: {
        newTimetableEntry: {
          include: {
            courseoffering: true,
            room: true,
            section: true
          }
        }
      }
    });

    if (!reschedule) {
      return res.status(404).json({ 
        error: "Reschedule not found or you don't have permission" 
      });
    }

    // Parse new times
    const [startHours, startMinutes] = newStartTime.split(':').map(Number);
    const [endHours, endMinutes] = newEndTime.split(':').map(Number);
    
    const newStartTimeObj = new Date();
    newStartTimeObj.setHours(startHours, startMinutes, 0, 0);
    
    const newEndTimeObj = new Date();
    newEndTimeObj.setHours(endHours, endMinutes, 0, 0);

    // Validate time logic
    if (newStartTimeObj >= newEndTimeObj) {
      return res.status(400).json({ 
        error: "Start time must be before end time" 
      });
    }

    const roomToUse = newRoomId ? parseInt(newRoomId) : reschedule.newTimetableEntry.roomId;

    // Check conflicts (excluding the current rescheduled entry)
    const conflicts = await Promise.all([
      // Teacher conflict
      prisma.timetableentry.findFirst({
        where: {
          id: { not: reschedule.newTimetableEntry.id },
          teacher: reschedule.newTimetableEntry.teacher,
          day: newDay,
          OR: [
            {
              AND: [
                { startTime: { lte: newStartTimeObj } },
                { endTime: { gt: newStartTimeObj } }
              ]
            },
            {
              AND: [
                { startTime: { lt: newEndTimeObj } },
                { endTime: { gte: newEndTimeObj } }
              ]
            }
          ]
        }
      }),
      // Section conflict
      prisma.timetableentry.findFirst({
        where: {
          id: { not: reschedule.newTimetableEntry.id },
          sectionId: reschedule.newTimetableEntry.sectionId,
          day: newDay,
          OR: [
            {
              AND: [
                { startTime: { lte: newStartTimeObj } },
                { endTime: { gt: newStartTimeObj } }
              ]
            },
            {
              AND: [
                { startTime: { lt: newEndTimeObj } },
                { endTime: { gte: newEndTimeObj } }
              ]
            }
          ]
        }
      }),
      // Room conflict
      prisma.timetableentry.findFirst({
        where: {
          id: { not: reschedule.newTimetableEntry.id },
          roomId: roomToUse,
          day: newDay,
          OR: [
            {
              AND: [
                { startTime: { lte: newStartTimeObj } },
                { endTime: { gt: newStartTimeObj } }
              ]
            },
            {
              AND: [
                { startTime: { lt: newEndTimeObj } },
                { endTime: { gte: newEndTimeObj } }
              ]
            }
          ]
        }
      })
    ]);

    if (conflicts[0]) {
      return res.status(409).json({ 
        error: "Teacher is not available at the specified time" 
      });
    }

    if (conflicts[1]) {
      return res.status(409).json({ 
        error: "Section has another class at the specified time" 
      });
    }

    if (conflicts[2]) {
      return res.status(409).json({ 
        error: "Room is not available at the specified time" 
      });
    }

    // Update the timetable entry
    const updatedTimetableEntry = await prisma.timetableentry.update({
      where: { id: reschedule.newTimetableEntry.id },
      data: {
        day: newDay,
        startTime: newStartTimeObj,
        endTime: newEndTimeObj,
        roomId: roomToUse
      },
      include: {
        courseoffering: true,
        room: true,
        section: true
      }
    });

    res.json({
      message: "Reschedule updated successfully",
      updatedTimetableEntry: updatedTimetableEntry
    });

  } catch (error) {
    console.error("Failed to update reschedule:", error);
    res.status(500).json({ 
      error: "Failed to update reschedule", 
      details: error.message 
    });
  }
});

// DELETE - Cancel reschedule (remove rescheduled class)
app.delete("/reschedule-class/:rescheduleId", authenticateToken, requireTeacher, async (req, res) => {
  const { rescheduleId } = req.params;
  const teacherId = req.user.id;

  try {
    // Find the reschedule record
    const reschedule = await prisma.classReschedule.findFirst({
      where: {
        id: parseInt(rescheduleId),
        teacherId: teacherId
      }
    });

    if (!reschedule) {
      return res.status(404).json({ 
        error: "Reschedule not found or you don't have permission" 
      });
    }

    // Delete the rescheduled timetable entry and reschedule record
    await prisma.$transaction([
      prisma.timetableentry.delete({
        where: { id: reschedule.newTimetableId }
      }),
      prisma.classReschedule.delete({
        where: { id: parseInt(rescheduleId) }
      })
    ]);

    res.json({
      message: "Reschedule cancelled successfully. The class remains cancelled."
    });

  } catch (error) {
    console.error("Failed to cancel reschedule:", error);
    res.status(500).json({ 
      error: "Failed to cancel reschedule", 
      details: error.message 
    });
  }
});

// GET - View teacher's rescheduled classes
app.get("/my-rescheduled-classes", authenticateToken, requireTeacher, async (req, res) => {
  const teacherId = req.user.id;

  try {
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: { name: true }
    });

    const rescheduledClasses = await prisma.classReschedule.findMany({
      where: { teacherId: teacherId },
      include: {
        cancellation: {
          include: {
            timetableentry: {
              include: {
                courseoffering: true,
                room: true,
                section: true
              }
            }
          }
        },
        newTimetableEntry: {
          include: {
            courseoffering: true,
            room: true,
            section: true
          }
        }
      },
      orderBy: { rescheduledAt: 'desc' }
    });

    const formattedReschedules = rescheduledClasses.map(reschedule => ({
      id: reschedule.id,
      rescheduledAt: reschedule.rescheduledAt,
      originalClass: {
        day: reschedule.cancellation.timetableentry.day,
        startTime: reschedule.cancellation.timetableentry.startTime.toTimeString().substr(0, 5),
        endTime: reschedule.cancellation.timetableentry.endTime.toTimeString().substr(0, 5),
        room: reschedule.cancellation.timetableentry.room.roomNumber,
        course: reschedule.cancellation.timetableentry.courseoffering.coursename,
        section: reschedule.cancellation.timetableentry.section.sectionDisplay
      },
      newClass: {
        day: reschedule.newTimetableEntry.day,
        startTime: reschedule.newTimetableEntry.startTime.toTimeString().substr(0, 5),
        endTime: reschedule.newTimetableEntry.endTime.toTimeString().substr(0, 5),
        room: reschedule.newTimetableEntry.room.roomNumber,
        course: reschedule.newTimetableEntry.courseoffering.coursename,
        section: reschedule.newTimetableEntry.section.sectionDisplay
      },
      cancellationReason: reschedule.cancellation.reason
    }));

    res.json({
      teacherName: teacher.name,
      rescheduledClasses: formattedReschedules
    });

  } catch (error) {
    console.error("Failed to fetch rescheduled classes:", error);
    res.status(500).json({ 
      error: "Failed to fetch rescheduled classes", 
      details: error.message 
    });
  }
});

// GET - View reschedules for students
app.get("/rescheduled-classes", authenticateToken, async (req, res) => {
  try {
    let whereClause = {};
    
    // If user is a student, filter by their section
    if (req.user.role === 'student') {
      const student = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { section: true }
      });
      
      if (student && student.section) {
        whereClause = {
          newTimetableEntry: {
            section: {
              sectionDisplay: student.section
            }
          }
        };
      }
    }

    const rescheduledClasses = await prisma.classReschedule.findMany({
      where: whereClause,
      include: {
        cancellation: {
          include: {
            timetableentry: {
              include: {
                courseoffering: true,
                room: true,
                section: true
              }
            }
          }
        },
        newTimetableEntry: {
          include: {
            courseoffering: true,
            room: true,
            section: true
          }
        }
      },
      orderBy: { rescheduledAt: 'desc' }
    });

    const formattedReschedules = rescheduledClasses.map(reschedule => ({
      id: reschedule.id,
      rescheduledAt: reschedule.rescheduledAt,
      rescheduledBy: reschedule.rescheduledBy,
      status: 'rescheduled',
      statusColor: '#FFA500', // Orange for rescheduled
      originalClass: {
        day: reschedule.cancellation.timetableentry.day,
        startTime: reschedule.cancellation.timetableentry.startTime.toTimeString().substr(0, 5),
        endTime: reschedule.cancellation.timetableentry.endTime.toTimeString().substr(0, 5),
        room: reschedule.cancellation.timetableentry.room.roomNumber,
        course: reschedule.cancellation.timetableentry.courseoffering.coursename,
        section: reschedule.cancellation.timetableentry.section.sectionDisplay
      },
      newClass: {
        day: reschedule.newTimetableEntry.day,
        startTime: reschedule.newTimetableEntry.startTime.toTimeString().substr(0, 5),
        endTime: reschedule.newTimetableEntry.endTime.toTimeString().substr(0, 5),
        room: reschedule.newTimetableEntry.room.roomNumber,
        course: reschedule.newTimetableEntry.courseoffering.coursename,
        section: reschedule.newTimetableEntry.section.sectionDisplay
      },
      cancellationReason: reschedule.cancellation.reason
    }));

    res.json({
      rescheduledClasses: formattedReschedules
    });

  } catch (error) {
    console.error("Failed to fetch rescheduled classes:", error);
    res.status(500).json({ 
      error: "Failed to fetch rescheduled classes", 
      details: error.message 
    });
  }
});







  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
  });
}

// Function to automatically reactivate canceled classes after 12 hours
function setupAutomaticClassReactivation() {
  console.log('Setting up automatic class reactivation system...');
  
  // Check every 30 minutes for classes that need to be reactivated
  setInterval(async () => {
    try {
      console.log('Checking for classes to automatically reactivate...');
      
      // Calculate the timestamp for 12 hours ago
      const twelveHoursAgo = new Date();
      twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);
      
      // Find all cancellations older than 12 hours
      const oldCancellations = await prisma.classCancellation.findMany({
        where: {
          cancelledAt: {
            lt: twelveHoursAgo
          }
        },
        include: {
          timetableentry: true,
          teacher: {
            select: { name: true, email: true }
          }
        }
      });
      
      console.log(`Found ${oldCancellations.length} canceled classes older than 12 hours to reactivate`);
      
      // Process each cancellation
      for (const cancellation of oldCancellations) {
        try {
          // Delete the cancellation (reactivate the class)
          await prisma.classCancellation.delete({
            where: { id: cancellation.id }
          });
          
          console.log(`Automatically reactivated class ID: ${cancellation.timetableId}, canceled by: ${cancellation.teacher.name}`);
          
          // You could add notification logic here if needed
          // For example, sending an email to the teacher that their class has been reactivated
          
        } catch (error) {
          console.error(`Failed to automatically reactivate class ID: ${cancellation.timetableId}`, error);
        }
      }
    } catch (error) {
      console.error('Error in automatic class reactivation job:', error);
    }
  }, 30 * 60 * 1000); // Run every 30 minutes
}

// Start the server
main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

app.listen(3001, () => console.log("Server listening on port 3001"));
