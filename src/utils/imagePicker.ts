import { Application, knownFolders, path } from "@nativescript/core";

export interface PickedImage {
  uri: string;
  name: string;
  type: string;
}

const REQUEST_CODE = 43127;

function inferFileName(uri: string): string {
  const raw = uri.split("?")[0];
  const part = raw.split("/").pop() || "";
  if (part.includes(".")) return part;
  return `image_${Date.now()}.jpg`;
}

function queryDisplayName(resolver: android.content.ContentResolver, uri: android.net.Uri): string | null {
  let cursor: android.database.Cursor | null = null;
  try {
    const projection = [android.provider.OpenableColumns.DISPLAY_NAME];
    cursor = resolver.query(uri, projection, null as any, null as any, null as any);
    if (!cursor || !cursor.moveToFirst()) return null;
    const index = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME);
    if (index < 0) return null;
    return String(cursor.getString(index));
  } catch {
    return null;
  } finally {
    cursor?.close();
  }
}

function copyContentUriToTempPath(
  resolver: android.content.ContentResolver,
  uri: android.net.Uri,
  fileName: string,
): string | null {
  let inputStream: java.io.InputStream | null = null;
  let outputStream: java.io.FileOutputStream | null = null;
  try {
    inputStream = resolver.openInputStream(uri);
    if (!inputStream) return null;

    const safeName = fileName.trim() || `image_${Date.now()}.jpg`;
    const tempPath = path.join(knownFolders.temp().path, safeName);
    outputStream = new java.io.FileOutputStream(new java.io.File(tempPath));

    const buffer = Array.create("byte", 8192);
    let read = 0;
    while ((read = inputStream.read(buffer)) > 0) {
      outputStream.write(buffer, 0, read);
    }
    outputStream.flush();
    return tempPath;
  } catch {
    return null;
  } finally {
    try {
      inputStream?.close();
      outputStream?.close();
    } catch {
      // no-op
    }
  }
}

export function pickImageFromDevice(): Promise<PickedImage | null> {
  if (typeof android === "undefined") {
    return Promise.resolve(null);
  }

  const activity = Application.android.foregroundActivity || Application.android.startActivity;
  if (!activity) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const intent = new android.content.Intent(android.content.Intent.ACTION_GET_CONTENT);
    intent.setType("image/*");
    intent.addCategory(android.content.Intent.CATEGORY_OPENABLE);

    const chooser = android.content.Intent.createChooser(intent, "Выберите изображение");

    const onResult = (args: any) => {
      if (args.requestCode !== REQUEST_CODE) return;
      Application.android.off(Application.AndroidApplication.activityResultEvent, onResult);

      if (args.resultCode !== android.app.Activity.RESULT_OK || !args.intent) {
        resolve(null);
        return;
      }

      const data = args.intent.getData();
      if (!data) {
        resolve(null);
        return;
      }

      const resolver = activity.getContentResolver();
      const mimeType = String(resolver.getType(data) || "image/jpeg");
      const displayName = queryDisplayName(resolver, data) || inferFileName(String(data.toString()));
      const scheme = String(data.getScheme() || "");
      let uploadUri = String(data.toString());

      if (scheme === "content") {
        const copiedPath = copyContentUriToTempPath(resolver, data, displayName);
        if (!copiedPath) {
          resolve(null);
          return;
        }
        uploadUri = copiedPath;
      } else if (scheme === "file") {
        uploadUri = String(data.getPath() || "");
      }

      resolve({
        uri: uploadUri,
        name: displayName,
        type: mimeType,
      });
    };

    Application.android.on(Application.AndroidApplication.activityResultEvent, onResult);
    activity.startActivityForResult(chooser, REQUEST_CODE);
  });
}
