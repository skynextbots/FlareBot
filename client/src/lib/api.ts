const API_BASE_URL = '';

export async function apiRequest(method: string, endpoint?: string, data?: any): Promise<Response> {
  const url = endpoint ? `${API_BASE_URL}${endpoint}` : method;
  const options: RequestInit = {
    method: endpoint ? method : 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  return fetch(url, options);
}