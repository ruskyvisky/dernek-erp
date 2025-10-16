// lib/api/fetcher.ts
interface FetcherOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  payload?: Record<string, any>;
  headers?: Record<string, string>;
}

const fetcher = async (
  url: string,
  options: FetcherOptions = {}
): Promise<any> => {
  const { method = "GET", payload, headers = {} } = options;
 console.log("💥 Gelen URL:", url);
  console.log("💥 typeof URL:", typeof url);
  let fullUrl = url;
  let fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  // Timeout için AbortController kullan
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 saniye
  fetchOptions.signal = controller.signal;

  if (method === "GET" && payload) {
    fullUrl += `?${new URLSearchParams(payload).toString()}`;
  } else if (payload) {
    fetchOptions.body = JSON.stringify(payload);
  }
console.log("Fetch options:", fetchOptions);
  console.log(`[${method}] Fetching:`, fullUrl);
  console.log("Request payload:", payload);

  try {
    const res = await fetch(fullUrl, fetchOptions);
    clearTimeout(timeoutId); // Başarılı response gelirse timeout'u temizle

    console.log("Response status:", res.status);
    console.log("Response headers:", Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      let errorText;
      try {
        errorText = await res.text();
      } catch (e) {
        errorText = `HTTP ${res.status} - ${res.statusText}`;
      }
      console.error("Hata Durumu:", res.status, errorText);
      throw new Error(`API isteği başarısız oldu: ${errorText}`);
    }

    const contentType = res.headers.get("Content-Type");
    
    if (contentType?.includes("application/json")) {
      const jsonResponse = await res.json();
      console.log("JSON Response:", jsonResponse);
      return jsonResponse;
    } else {
      const textResponse = await res.text();
      console.log("Text Response:", textResponse);
      return textResponse;
    }
  } catch (error: any) {
    clearTimeout(timeoutId); // Hata durumunda da timeout'u temizle
    console.error("Fetch error:", error);
    
    if (error.name === 'AbortError') {
      throw new Error("İstek zaman aşımına uğradı. Lütfen tekrar deneyin.");
    }
    
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      throw new Error("Ağ hatası: Sunucuya ulaşılamıyor. Lütfen bağlantınızı kontrol edin.");
    }
    
    throw error;
  }
};

export default fetcher;