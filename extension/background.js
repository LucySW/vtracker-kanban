let SUPABASE_URL = "https://rfjsqxntwbyexfbgabzn.supabase.co";
let SUPABASE_ANON_KEY = "sb_publishable_jsa4hkOCAFSNBc5mdsxWKQ_soxZ3LV7";

// Load config from storage (overrides defaults)
chrome.storage.local.get(['supabaseUrl', 'supabaseAnonKey'], (res) => {
    if (res.supabaseUrl) SUPABASE_URL = res.supabaseUrl;
    if (res.supabaseAnonKey) SUPABASE_ANON_KEY = res.supabaseAnonKey;
});

// Update config if changed in popup
chrome.storage.onChanged.addListener((changes) => {
    if (changes.supabaseUrl) SUPABASE_URL = changes.supabaseUrl.newValue;
    if (changes.supabaseAnonKey) SUPABASE_ANON_KEY = changes.supabaseAnonKey.newValue;
});

const tempTasks = {};       // Store tasks while they are processing
const sentTaskIds = new Set(); // Dedup: track already-sent task IDs
let captureCount = 0;         // Badge counter

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'VTRACKER_FETCH_INTERCEPT') {
        handleIntercept(message);
    }
    // Allow popup to query capture count
    if (message.type === 'VTRACKER_GET_STATUS') {
        sendResponse({ captureCount, pendingTasks: Object.keys(tempTasks).length });
    }
});

async function handleIntercept({ platform, url, requestBody, responseBody }) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn('VTracker: Supabase config missing. Please set in popup.');
        return;
    }

    try {
        let isSubmit = false;
        let isPolling = false;
        let taskId = null;
        let videoUrl = null;
        let status = 'processing';
        
        // --- KLING HEURISTICS ---
        if (platform === 'kling') {
            if (url.includes('/task/submit') || url.includes('/generate') || url.includes('/video/create')) {
                isSubmit = true;
                taskId = responseBody?.data?.task_id || responseBody?.data?.task?.id || responseBody?.taskId;
            } else if (url.includes('/task/query') || url.includes('/task/info') || url.includes('/task/status')) {
                isPolling = true;
                const task = responseBody?.data?.tasks?.[0] || responseBody?.data?.task || responseBody?.data;
                if (task) {
                    taskId = task.task_id || task.id;
                    if (task.status === 'succeed' || task.status === 'completed' || task.status === 99 || task.status === 5) {
                        status = 'completed';
                        videoUrl = task.works?.[0]?.resource?.resource 
                            || task.works?.[0]?.cover?.resource 
                            || task.video_url
                            || task.result_url;
                    } else if (task.status === 'failed' || task.status === -1) {
                        status = 'failed';
                    }
                }
            }
        }
        
        // --- WAVESPEED HEURISTICS ---
        else if (platform === 'wavespeed') {
             if (url.includes('/video/generate') || url.includes('/api/v3/video') || url.includes('/generate')) {
                 isSubmit = true;
                 taskId = responseBody?.data?.id || responseBody?.id || responseBody?.task_id || responseBody?.data?.task_id;
             } else if (url.includes('/task') || url.includes('/status') || url.includes('/query') || url.includes('/result')) {
                 isPolling = true;
                 const task = responseBody?.data || responseBody;
                 taskId = task?.id || task?.task_id;
                 if (task?.status === 'succeeded' || task?.status === 'completed' || task?.state === 'SUCCESS') {
                     status = 'completed';
                     videoUrl = task?.video_url || task?.output?.[0] || task?.result?.url || task?.outputs?.[0]?.url;
                 } else if (task?.status === 'failed' || task?.state === 'FAILED') {
                     status = 'failed';
                 }
             }
        }

        // --- GENERIC FALLBACK HEURISTICS ---
        // If platform is unknown or nothing matched, try to detect from response content
        if (!isSubmit && !isPolling && responseBody) {
            // Look for task submission patterns
            if (requestBody?.prompt && (responseBody?.data?.task_id || responseBody?.task_id || responseBody?.id)) {
                isSubmit = true;
                taskId = responseBody?.data?.task_id || responseBody?.task_id || responseBody?.id;
                platform = platform || 'unknown';
            }
            // Look for completion patterns
            if (responseBody?.video_url || responseBody?.data?.video_url || responseBody?.result?.url) {
                isPolling = true;
                taskId = responseBody?.task_id || responseBody?.data?.task_id || responseBody?.id;
                status = 'completed';
                videoUrl = responseBody?.video_url || responseBody?.data?.video_url || responseBody?.result?.url;
                platform = platform || 'unknown';
            }
        }

        // --- PROCESSING PIPELINE ---
        if (isSubmit && taskId) {
            const tid = String(taskId);
            tempTasks[tid] = {
                platform,
                task_id: tid,
                prompt: requestBody?.prompt || requestBody?.text || requestBody?.data?.prompt || requestBody?.input?.prompt || "Prompt desconhecido",
                reference_image_url: requestBody?.image_url || requestBody?.image || requestBody?.data?.image_url || null,
                aspect_ratio: requestBody?.aspect_ratio || requestBody?.ratio || requestBody?.image_ratio || null,
                model_name: requestBody?.model_name || requestBody?.model || requestBody?.data?.model || null,
                duration: requestBody?.duration ? String(requestBody?.duration) : null,
                raw_request: requestBody
            };
            console.log('[VTracker] Intercepted submission:', tid, tempTasks[tid].prompt?.substring(0, 60));
        }

        if (isPolling && taskId && status !== 'processing') {
            const tid = String(taskId);
            
            // DEDUP: Skip if we already sent this task
            if (sentTaskIds.has(tid)) {
                console.log(`[VTracker] Task ${tid} already sent, skipping duplicate.`);
                return;
            }
            
            const taskData = tempTasks[tid] || { 
                platform, 
                task_id: tid,
                prompt: "Capturado apenas no polling",
            };
            
            taskData.video_url = videoUrl;
            taskData.status = status;
            taskData.raw_response = responseBody;

            // Fetch session details from storage for the v2 Web App format!
            chrome.storage.local.get(['supabaseSession', 'vtrackerProjectId', 'vtrackerColumnId'], async (res) => {
                const session = res.supabaseSession;
                const projectId = res.vtrackerProjectId;
                const columnId = res.vtrackerColumnId;
                
                if (!session || !projectId || !columnId) {
                    console.error("[VTracker] Cannot save card. Missing Session, Project ID, or Column ID. Please login in the extension popup.");
                    return;
                }

                const payload = {
                    project_id: projectId,
                    column_id: columnId,
                    user_id: session.user.id,
                    position: 0, // Gets placed at the top or bottom; handle logic if needed
                    platform: taskData.platform,
                    task_id: taskData.task_id,
                    prompt: taskData.prompt,
                    video_url: taskData.video_url,
                    reference_image_url: taskData.reference_image_url,
                    status: taskData.status,
                    model_name: taskData.model_name,
                    aspect_ratio: taskData.aspect_ratio,
                    duration: taskData.duration,
                    raw_request: taskData.raw_request,
                    raw_response: taskData.raw_response
                };

                console.log(`[VTracker] Task ${tid} → ${status}!`, videoUrl?.substring(0, 80));
                const success = await sendToSupabase(payload, session.access_token);
                
                if (success) {
                    sentTaskIds.add(tid); // Mark as sent
                    captureCount++;
                    updateBadge();
                }
                
                delete tempTasks[tid]; // Cleanup
            });
        }

    } catch (e) {
        console.error("[VTracker] Error handling intercept", e);
    }
}

async function sendToSupabase(payload, accessToken) {
    try {
        const cleanUrl = SUPABASE_URL.endsWith('/') ? SUPABASE_URL.slice(0, -1) : SUPABASE_URL;
        const response = await fetch(`${cleanUrl}/rest/v1/cards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${accessToken}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errText = await response.text();
            console.error("[VTracker] Supabase insert failed:", response.status, errText);
            return false;
        } else {
            console.log("[VTracker] ✅ Successfully sent to Supabase Cards!");
            return true;
        }
    } catch (err) {
        console.error("[VTracker] Network error sending to Supabase", err);
        return false;
    }
}

function updateBadge() {
    chrome.action.setBadgeText({ text: captureCount > 0 ? String(captureCount) : '' });
    chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
}
