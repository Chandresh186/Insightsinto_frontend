// src/app/constants/api.constants.ts

export const API_CONSTANTS = {

  
    // Authentication Endpoints
    AUTH: {
      LOGIN: 'Account/login',
      REGISTER: 'Account/register',
      LOGOUT: '/Account/logout-details',
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
  
    // Other Endpoints
    // Add more API endpoints as needed
    TESTSERIES: {
      GET_ALL_TEST_SERIES: 'TestSeries',
      GET_TEST_SERIES_BY_ID: (id: string) => `TestSeries/${id}`,
      GET_TEST_SERIES_BY_USER_ID: (id: string) => `TestSeries/GetTestSeriesByUserId/${id}`,
      CREATE_TEST_SERIES: 'TestSeries',
      UPDATE_TEST_SERIES: (id: string) => `TestSeries/${id}`,
      DELETE_TEST_SERIES: (id: string) => `TestSeries/${id}`,


      GET_TEST_By_TEST_SERIES_ID: (id: string) => `Test/testSeries/${id}`,
      DELETE_TEST: (testSeriesId: string, testId: string) => `Test/${testSeriesId}/${testId}`,


      FETCH_QUESTIONS_FOR_TEST : 'Test/FetchQuestionsForTest',

      ADD_QUESTIONS_TO_TEST : 'TestQuestionsMapping',
      GET_TEST_BY_ID : (id: string) => `TestQuestionsMapping/${id}`,


      CREATE_TEST: (testSeriesId: string) => `Test/CreateTest?testSeriesId=${testSeriesId}`,
      START_TEST: 'Test/start',
      SUMBIT_TEST: 'Test/submitTest'
    },


    PAYMENT : {
      CREATE_ORDER: 'Payment/create-order',
      VERIFY_PAYMENT: 'Payment/verify-payment',
    },

    
  
    // Add any other module's API endpoints here...
  };
  