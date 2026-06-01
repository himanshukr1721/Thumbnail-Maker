const API_BASE = "/api";

export async function uploadHeadshot(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/upload-headshot`, {
        method: "POST",
        body: form,
    });
    if (!res.ok) {
        const detail = await res.json().catch(() => null);
        const msg = detail?.detail ?? res.statusText;
        throw new Error(`Failed to upload headshot: ${msg}`);
    }
    return res.json();
}

export async function createjob({prompt, headshotUrl, styleName}: {prompt: string, headshotUrl: string, styleName: string}): Promise<string> {
    const res = await fetch(`${API_BASE}/jobs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            prompt,
            headshot_url: headshotUrl,
            style_name: styleName,
        }),
    });
    if (!res.ok) {
        const detail = await res.json().catch(() => null);
        const msg = detail?.detail ?? res.statusText;
        throw new Error(`Failed to create job: ${msg}`);
    }
    return res.json();
}

export async function subscribeToJob(jobId: any, {onThumbnailReady, onThumbnailFailed, onJobComplete,OnError}: {onThumbnailReady: (data: any) => void, onThumbnailFailed: (data: any) => void, onJobComplete: (data: any) => void, OnError: (error: any) => void}) {
    
    const evtSource = new EventSource(`${API_BASE}/jobs/${jobId}/stream`);
    
    evtSource.addEventListener("thumbnail_ready", (event) => {
        onThumbnailReady(JSON.parse(event.data));
    });
    
    evtSource.addEventListener("thumbnail_failed", (event) => {
        onThumbnailFailed(JSON.parse(event.data));
    });
    
    evtSource.addEventListener("job_complete", (event) => {
        onJobComplete(JSON.parse(event.data));
        evtSource.close();
    });
    
    evtSource.addEventListener("error", (event) => {
        OnError(event);
        evtSource.close();
    });
    return evtSource;
}
