import 'package:flutter/material.dart';

import '../backend/index.dart';

/// Returns a future that resolves to the image at [path].
Future<ImageProvider> getCloudStorageImage(String path) async {
  return firebaseStorage.ref().child(path).getData().then((bytes) {
    if (bytes == null) {
      throw FormatException('Could not download storage image at $path.');
    }
    return Image.memory(bytes).image;
  });
}
