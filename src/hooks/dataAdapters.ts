import userService from "@/services/userService";

export const coursesAdapter = async (uid: string, params: { limit?: number; lastId?: string; search?: string }) => {
  const response = await userService.getCoursesPerUser(uid, params);
  
  if (response.courses) {
    return {
      data: response.courses,
      pagination: response.pagination,
    };
  }
  
  if (Array.isArray(response)) {
    return {
      data: response,
      pagination: {
        hasMore: false,
        lastId: null,
        limit: response.length,
        count: response.length,
      },
    };
  }
  
  return {
    data: [],
    pagination: {
      hasMore: false,
      lastId: null,
      limit: 0,
      count: 0,
    },
  };
};

export const ebooksAdapter = async (uid: string, params: { limit?: number; lastId?: string; search?: string }) => {
  const response = await userService.getEbooksPerUser(uid, params);
  
  if (response.ebooks) {
    return {
      data: response.ebooks,
      pagination: response.pagination,
    };
  }
  
  if (Array.isArray(response)) {
    return {
      data: response,
      pagination: {
        hasMore: false,
        lastId: null,
        limit: response.length,
        count: response.length,
      },
    };
  }
  
  return {
    data: [],
    pagination: {
      hasMore: false,
      lastId: null,
      limit: 0,
      count: 0,
    },
  };
};

export const eventosAdapter = async (uid: string, params: { limit?: number; lastId?: string; search?: string }) => {
  const response = await userService.getEventosPerUser(uid, params);
  
  if (response.eventos) {
    return {
      data: response.eventos,
      pagination: response.pagination,
    };
  }
  
  if (Array.isArray(response)) {
    return {
      data: response,
      pagination: {
        hasMore: false,
        lastId: null,
        limit: response.length,
        count: response.length,
      },
    };
  }
  
  return {
    data: [],
    pagination: {
      hasMore: false,
      lastId: null,
      limit: 0,
      count: 0,
    },
  };
};
