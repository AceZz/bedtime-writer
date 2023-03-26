import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'firebase/index.dart';
import 'user.dart';

/// The main provider for everything user-related.
///
/// Note: this is where the "concrete" implementation of [User] is chosen.
final userProvider = Provider<User>((ref) => getFirebaseUser(ref));
