import { unwrappedApi, type Fetch } from '../api';

export type UploadAcceptance = {
	accepts: UploadAccept[];
	rejects: UploadReject[];
};

export type UploadAccept = {
	ref_id?: string; // if provided in request, else null and client must correlate by original_filename
	original_filename: string;
	object_name: string;
};

export type UploadReject = {
	ref_id?: string; // if provided in request, else null and client must correlate by original_filename
	original_filename: string;
	reason: string;
};

export async function uploadFiles(
	base: string,
	fetcher: Fetch,
	files: File[],
	ref_ids?: string[],
	signal?: AbortSignal
): Promise<UploadAcceptance> {
	const formData = new FormData();

	if (ref_ids && ref_ids.length !== files.length) {
		throw new Error('ref_ids length must match files length');
	}

	for (const file of files) {
		formData.append('files[]', file, file.name);
	}
	for (const ref_id of ref_ids ?? []) {
		formData.append('ref_ids[]', ref_id);
	}

	return unwrappedApi(fetcher, `${base}/storage/`, {
		method: 'POST',
		body: formData,
		signal
	});
}
