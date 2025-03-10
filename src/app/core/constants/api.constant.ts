// src/app/constants/api.constants.ts

export const API_CONSTANTS = {

  
    // Authentication Endpoints
    AUTH: {
      LOGIN: 'Account/login',
      REGISTER: 'Account/register',
      LOGOUT: 'Account/logout-details',
      REGISTER_AND_LOGIN: 'Account/registerAndLogin',
      RESEND_OTP: "Account/send-otp",
      VALIDATE_OTP: "Account/validate-otp",
    },

    USER: {
      GET_USER_BY_ID: (userId: string) => `Account/profile?userId=${userId}`,
      UPDATE_USER: (userId: string) => `Account/update-profile/${userId}`
    },
  
    // User Endpoints
    CATEGORIES: {
      GET_ALL_CATEGORIES: 'Category',
      GET_ALL_MAPPED_CATEGORIES: 'Category/categories-with-subcategories',
      CREATE_CATEGORY: 'Category',
      GET_CATEGORY_BY_ID: (id: string) => `Category/${id}`,
      UPDATE_CATEGORY: (id: string) => `Category/${id}`,
      DELETE_CATEGORY: (id: string) => `Category/${id}`
    },

    Blogs: {
      GET_ALL_BLOGS: 'Blog',
      CREATE_BLOG: 'Blog',
      GET_BLOG_BY_ID: (id: string) => `Blog/${id}`,
      UPDATE_BLOG_BY_ID: (id: string) => `Blog/${id}`,
      DELETE_BLOG_BY_ID: (id: string) => `Blog/${id}`

    },

    Questions: {
      GET_ALL_QUESTIONS: 'Question',
      CREATE_QUESTION: 'Question',
      GET_QUESTION_BY_ID: (id: string) => `Question/${id}`,
      UPDATE_QUESTION_BY_ID: (id: string) => `Question/${id}`,
      DELETE_QUESTION_BY_ID: (id: string) => `Question/${id}`
    },

    COUPONS: {
      CREATE_COUPON : 'PromoCode',
      GET_ALL_COUPON :  'PromoCode/all',
      GET_COUPON_BY_CODE : (code: string) => `PromoCode/code/${code}`,
      DELETE_COUPON_BY_ID : (id: string) => `PromoCode/${id}`,
    },
  
    // Other Endpoints
    // Add more API endpoints as needed
    TESTSERIES: {
      GET_ALL_TEST_SERIES: 'TestSeries',
      GET_ALL_TEST: 'Test',
      
      GET_TEST_SERIES_BY_ID: (id: string) => `TestSeries/${id}`,
      GET_TEST_SERIES_BY_USER_ID: (id: string, testSeriesId: string) => `TestSeries/GetTestSeriesByUserId/${id}/${testSeriesId}`,
      CREATE_TEST_SERIES: 'TestSeries',
      UPDATE_TEST_SERIES: (id: string) => `TestSeries/${id}`,
      DELETE_TEST_SERIES: (id: string) => `TestSeries/${id}`,


      GET_TEST_By_TEST_SERIES_ID: (id: string) => `Test/testSeries/${id}`,
      GET_USER_TEST_By_TEST_SERIES_ID: (testSeriesId: string, userId: string) => `Test/testSeries/${testSeriesId}/user/${userId}`,
      DELETE_TEST_FROM_TEST_SERIES: (testSeriesId: string, testId: string) => `Test/${testSeriesId}/${testId}`,

      GET_TEST_RESULT_BY_ID: (testId: string, userId: string) => `Test/result/test/${testId}/user/${userId}`,


      FETCH_QUESTIONS_FOR_TEST : 'Test/FetchQuestionsForTest',

      ADD_QUESTIONS_TO_TEST : 'TestQuestionsMapping',
      GET_TEST_PAPER_BY_ID : (id: string) => `TestQuestionsMapping/${id}`,
      GET_TEST_BY_ID : (id: string) => `Test/${id}`,


      CREATE_TEST : "Test/CreateTest",
      DELETE_TEST : (id: string) => `Test/${id}`,

      SUBMIT_TEST: (userId: string, testId: string) => `Test/checkanswers?userId=${userId}&testId=${testId}`,

      START_Online_TEST: 'Test/start',
      START_Offline_TEST: 'Test/offlineTest',
      SUMBIT_TEST: 'Test/submitTest',
      GET_ANALYSIS: (userId: string, testId: string)  => `Test/questions/${userId}/${testId}`,


    },

    Test_SERIES_TEST_MAPPING : {
      CREATE_MAPPING: "TestSeriesTestMapping/create",
      DELETE_MAPPING:(testSeriesId : any , testId: any) => `TestSeriesTestMapping/delete?testSeriesId=${testSeriesId}&testId=${testId}`
    },

    DAILY_EDITORIAL: {
      CREATE_DAILY_EDITORIAL: "DailyEditorial/upload",
      GET_ALL_EDITORIAL: "DailyEditorial/alleditorial",
      GET_ALL_EDITORIAL_By_UserId: (id: string)=>  `DailyEditorial/alleditorial/${id}`,
      GET_EDITORISL_BY_CURRENT_DATE: (date: string) => `DailyEditorial/${date}`,
      DELETE_EDITORIAL: (id: string) => `DailyEditorial/${id}`
    },

    Courses : {
      GET_ALL_COURSES: "CoursesAndChapters",
      GET_ALL_USER_COURSES: (id: string) => `CoursesAndChapters/GetCoursesByUserId/${id}`,
      GET_ALL_ACTIVE_COURSES: (val: boolean) => `CoursesAndChapters?isActive=${val}`,
      CREATE_COURSE: "CoursesAndChapters",
      GET_COURSE_BY_ID: (id:string) => `CoursesAndChapters/${id}`,
      GET_COURSE_BY_TEST_ID: (id:string) => `CoursesAndChapters/getCourseByTest${id}`,
      GET_PUBLIC_COURSE_BY_ID: (id:string) => `CoursesAndChapters/public/${id}`,
      UPDATE_COURSE_BY_ID: (id:string) => `CoursesAndChapters/${id}`,
      DELETE_COURSE_BY_ID: (id:string) => `CoursesAndChapters/${id}`,
      GET_CHAPTERS_COURSES_BY_COURSEID: (id:string) => `CoursesAndChapters?parentId=${id}`,
      GET_ALL_COURSE_Material_BY_ID: (id:string) => `CoursesAndChapters/courseMaterial/${id}`,
      DELETE_COURSE_Material_BY_ID: (id:string) => `CoursesAndChapters/courseMaterial/${id}`,
      Update_COURSE_MATERIAL: "CoursesAndChapters/courseMaterial"
    },
    
    ANSWERSHEET: {
      UPLOAD_TEST: "UserTestAnswerSheet/create",
      GET_CHAPTER_ANSWERSHEET_BY_COURSEID: (id: any) => `UserTestAnswerSheet/getByCourseId/${id}`,
    },

    ADMIN_DASHBOARD: {
      GET_ADMIN_DASHBOARD: "AdminDashboard/dashboard-data"
    },

    USER_DASHBOARD: {
      GET_USER_DASHBOARD: (id: string) => `UserDashboard/GetUserDashboard?userId=${id}`
    },

    USERS: {
      GET_ALL_USERS: "Account/get_all_users",
      DELETE_USERS: (userId: any) => `Account/delete_user/${userId}`
    },

    PERMISSIONS: {
      GET_ALL_PERMISSIONS: "Permission",
      CREATE_OR_UPDATE_PERMSSSIONS: "Permission/create-or-update",
      GET_ALL_USER_PERMISSIONS:(userId:any)=> `Permission/get-all/${userId}`
    },

    Roles: {
      GET_ALL_ROLES: "Roles/roles"
    },
   


    PAYMENT : {
      CREATE_ORDER: 'Payment/create-order',
      VERIFY_PAYMENT: 'Payment/verify-payment',
    },

    
  
    // Add any other module's API endpoints here...
  };
  