import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../backend/index.dart';
import '../../backend/user.dart';
import '../../config.dart';
import '../../widgets/index.dart';
import '../../widgets/sign_in.dart';

const accountCreationLimitDays = 1;

/// Asks the user to sign in and redirects to [redirect].
class SignInScreen extends ConsumerStatefulWidget {
  final String redirect;
  final String signInText;

  const SignInScreen({
    required this.redirect,
    required this.signInText,
    Key? key,
  }) : super(key: key);

  @override
  ConsumerState<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends ConsumerState<SignInScreen> {
  String _alertText = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _showAgeConfirmAlertDialog(
        context: context,
        ref: ref,
        cancelRedirect: '/',
      );
    });
  }

  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  void _googleOnPressed({
    required BuildContext context,
    required WidgetRef ref,
    required String redirect,
  }) async {
    showDialog(
      context: context,
      builder: (context) {
        return const Center(
          child: CircularProgressIndicator(),
        );
      },
    );

    final user = ref.read(userProvider);

    if (user is UnauthUser) {
      await user.signInWithGoogle();
    } else if (user is AnonymousUser) {
      await user.linkToGoogle();
    } else if (user is RegisteredUser) {
      throw Exception(
        'User is already signed in and should not be able to sign in with Google',
      );
    }

    context.pushReplacement(redirect);
  }

  void _signInOnTap({
    required BuildContext context,
    required WidgetRef ref,
    required String email,
    required String password,
    required String redirect,
  }) async {
    showDialog(
      context: context,
      builder: (context) {
        return const Center(
          child: CircularProgressIndicator(),
        );
      },
    );

    final user = ref.watch(userProvider);

    if (user is RegisteredUser) {
      throw Exception(
        'User is already signed-in and should not be able to re sign in',
      );
    }

    try {
      if (user is UnauthUser) {
        await user.signInWithEmailAndPassword(
          email: email,
          password: password,
        );
        context.pushReplacement(redirect);
      } else if (user is AnonymousUser) {
        await user.signInWithEmailAndPassword(
          email: email,
          password: password,
        );
        context.pushReplacement(redirect);
      }
    } on Exception catch (e) {
      context.pop();
      _setAlertText(context: context, e: e);
    }
  }

  void _createAccountOnTap({
    required BuildContext context,
    required WidgetRef ref,
    required String email,
    required String password,
    required String redirect,
  }) async {
    showDialog(
      context: context,
      builder: (context) {
        return const Center(
          child: CircularProgressIndicator(),
        );
      },
    );

    final user = ref.watch(userProvider);

    if (user is RegisteredUser) {
      throw Exception('User is signed-in and should not see this screen');
    }

    try {
      _checkAccountCreationAllowed(ref);
      if (user is UnauthUser) {
        await user.createUserWithEmailAndPassword(
          email: email,
          password: password,
        );
        await _updateAccountCreationLastDate(ref);
        context.pushReplacement(redirect);
      } else if (user is AnonymousUser) {
        await user.createUserWithEmailAndPassword(
          email: email,
          password: password,
        );
        await _updateAccountCreationLastDate(ref);
        context.pushReplacement(redirect);
      }
    } on Exception catch (e) {
      context.pop();
      _setAlertText(context: context, e: e);
    }
  }

  void _setAlertText({required BuildContext context, required Exception e}) {
    setState(() {
      _alertText = _convertExceptionToText(e: e);
    });
  }

  @override
  Widget build(BuildContext context) {
    Widget text = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Text(
        widget.signInText,
        textAlign: TextAlign.center,
        style: Theme.of(context).primaryTextTheme.headlineSmall,
      ),
    );

    Widget image = Image.asset(
      'assets/decoration/feather.png',
      width: 240,
    );

    Widget alertTextWidget = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: Text(
        _alertText,
        textAlign: TextAlign.center,
        style: GoogleFonts.outfit(
          color: Colors.red,
          fontWeight: FontWeight.normal,
          fontSize: 16.sp,
        ),
      ),
    );

    Widget emailTextField = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: AppTextField(
        controller: emailController,
        hintText: 'Email',
        obscureText: false,
      ),
    );

    Widget passwordTextField = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: AppTextField(
        controller: passwordController,
        hintText: 'Password',
        obscureText: true,
      ),
    );

    TextStyle forgotPasswordTextStyle = GoogleFonts.outfit(
      color: Theme.of(context).textTheme.bodySmall?.color!,
      fontWeight: FontWeight.normal,
      fontSize: 14.sp,
      decoration: TextDecoration.underline,
    );

    Widget forgotPasswordButton = Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 30),
          child: GestureDetector(
            onTap: () => _showResetPasswordAlertDialog(
              context: context,
              emailController: emailController,
            ),
            child: Text(
              'Reset or Forgot Password?',
              style: forgotPasswordTextStyle,
            ),
          ),
        ),
      ],
    );

    Widget signInButton = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: SignInScreenButton(
        text: 'Sign In',
        color: Theme.of(context).colorScheme.primary,
        onTap: () => _signInOnTap(
          context: context,
          ref: ref,
          email: emailController.text,
          password: passwordController.text,
          redirect: widget.redirect,
        ),
      ),
    );

    Widget createAccountButton = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: SignInScreenButton(
        text: 'Create account',
        color: Colors.grey.shade500,
        onTap: () => _createAccountOnTap(
          context: context,
          ref: ref,
          email: emailController.text,
          password: passwordController.text,
          redirect: widget.redirect,
        ),
      ),
    );

    Widget divider = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: Row(
        children: [
          Expanded(
            child: Divider(
              thickness: 0.5,
              color: Theme.of(context).colorScheme.onBackground,
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: Text(
              'or continue with',
              style: Theme.of(context).primaryTextTheme.bodySmall,
            ),
          ),
          Expanded(
            child: Divider(
              thickness: 0.5,
              color: Theme.of(context).colorScheme.onBackground,
            ),
          )
        ],
      ),
    );

    Widget googleSignInButton = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: Row(
        children: [
          Expanded(
            flex: 1,
            child: GoogleSignInButton(
              text: 'Google Sign in',
              onPressed: () => _googleOnPressed(
                context: context,
                ref: ref,
                redirect: widget.redirect,
              ),
            ),
          ),
        ],
      ),
    );

    return AppScaffold(
      appBarTitle: 'Sign in',
      child: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            const SizedBox(height: 40),
            image,
            const SizedBox(height: 20),
            text,
            const SizedBox(height: 30),
            alertTextWidget,
            const SizedBox(height: 10),
            emailTextField,
            const SizedBox(height: 10),
            passwordTextField,
            const SizedBox(height: 5),
            forgotPasswordButton,
            const SizedBox(height: 20),
            signInButton,
            const SizedBox(height: 10),
            createAccountButton,
            const SizedBox(height: 20),
            divider,
            const SizedBox(height: 20),
            googleSignInButton,
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }
}

void _showAgeConfirmAlertDialog({
  required BuildContext context,
  required WidgetRef ref,
  required String cancelRedirect,
}) {
  // Checks if the user has already confirmed email owner age
  final Preferences preferences = ref.read(preferencesProvider);
  if (!preferences.ageConfirmed) {
    // Asks to confirm
    showDialog(
      context: context,
      barrierDismissible:
          false, // Prevents dialog be escaped by clicking elsewhere
      builder: (BuildContext context) {
        const title = 'Friendly disclaimer';
        final content = Text(
          'Dreamy Tales is a magical place for all ages, but the email linked to your account should be owned by an adult. Thanks for confirming!',
          style: Theme.of(context).primaryTextTheme.bodySmall,
        );
        final actions = <Widget>[
          TextButton(
            onPressed: () async {
              ref.read(preferencesProvider.notifier).updateAgeConfirmed(true);
              context.pop();
            },
            child: Text(
              'Confirm',
              style: Theme.of(context).primaryTextTheme.bodySmall,
            ),
          ),
          TextButton(
            onPressed: () {
              context.pushReplacement(cancelRedirect);
            },
            child: Text(
              'Cancel',
              style: Theme.of(context).primaryTextTheme.bodySmall,
            ),
          ),
        ];
        return AppAlertDialog(
          title: title,
          content: content,
          actions: actions,
        );
      },
    );
  }
}

void _showResetPasswordAlertDialog({
  required BuildContext context,
  required TextEditingController emailController,
}) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return _AlertDialogResetPassword(emailController: emailController);
    },
  );
}

void _showResetPasswordConfirmationAlertDialog({
  required BuildContext context,
}) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      const title = 'Success';
      final content = Text(
        'We sent you an email to reset your password.',
        style: Theme.of(context).primaryTextTheme.bodySmall,
      );
      final actions = <Widget>[
        TextButton(
          onPressed: context.pop,
          child: Text(
            'Ok',
            style: Theme.of(context).primaryTextTheme.bodySmall,
          ),
        ),
      ];
      return AppAlertDialog(
        title: title,
        content: content,
        actions: actions,
      );
    },
  );
}

class _AlertDialogResetPassword extends StatefulWidget {
  final TextEditingController emailController;

  const _AlertDialogResetPassword({
    Key? key,
    required this.emailController,
  }) : super(key: key);

  @override
  State<_AlertDialogResetPassword> createState() =>
      _AlertDialogResetPasswordState();
}

class _AlertDialogResetPasswordState extends State<_AlertDialogResetPassword> {
  String _alertText = '';

  @override
  Widget build(BuildContext context) {
    Widget alertTextWidget = Text(
      _alertText,
      textAlign: TextAlign.center,
      style: GoogleFonts.outfit(
        color: Colors.red,
        fontWeight: FontWeight.normal,
        fontSize: 16,
      ),
    );

    Widget emailTextField = AppTextField(
      controller: widget.emailController,
      hintText: 'Email',
      obscureText: false,
    );

    void setAlertText({required Exception e}) {
      setState(() {
        _alertText = _convertExceptionToText(e: e);
      });
    }

    Future<void> submitResetPassword() async {
      try {
        await resetPassword(widget.emailController.text);
        context.pop();
        _showResetPasswordConfirmationAlertDialog(context: context);
      } on Exception catch (e) {
        setAlertText(e: e);
      }
    }

    const titleText = 'Reset your password';
    final content = SingleChildScrollView(
      child: ListBody(
        children: [
          alertTextWidget,
          const SizedBox(height: 10),
          emailTextField,
        ],
      ),
    );
    final actions = <Widget>[
      TextButton(
        onPressed: submitResetPassword,
        child: Text(
          'Submit',
          style: Theme.of(context).primaryTextTheme.bodySmall,
        ),
      ),
      TextButton(
        onPressed: context.pop,
        child: Text(
          'Cancel',
          style: Theme.of(context).primaryTextTheme.bodySmall,
        ),
      ),
    ];

    return AppAlertDialog(
      title: titleText,
      content: content,
      actions: actions,
    );
  }
}

String _convertExceptionToText({required Exception e}) {
  String text = 'An error occurred';

  if (e is AuthException) {
    switch (e.code) {
      case 'user-not-found':
        text = 'The user does not exist. Please check or create an account.';
        break;
      case 'wrong-password':
        text = 'Incorrect password';
        break;
      case 'invalid-email':
        text = 'The email format is not valid';
        break;
      case 'network-request-failed':
        text = 'Network request failed';
        break;
      case 'internal-error':
        text = 'Internal error';
        break;
      case 'weak-password':
        text = 'Please choose a stronger password';
        break;
      case 'email-already-in-use':
        text = 'An account already exists with this email. Please sign in.';
        break;
      case 'credential-already-in-use':
        text = 'Account already exists. Please sign in.';
        break;
      case 'limit-account-creation':
        text = 'Only one account can be created every 24 hours.';
        break;
    }
  } else if (e is FormatException) {
    switch (e.code) {
      case 'empty-email':
        text = 'Please enter an email';
        break;
      case 'invalid-email-format':
        text = 'The email format is not valid';
        break;
      case 'invalid-password-format':
        text =
            'Passwords must be at least 8 characters, with one letter and one digit';
        break;
      case 'empty-password':
        text = 'Please enter a password';
        break;
    }
  }

  return text;
}

void _checkAccountCreationAllowed(WidgetRef ref) {
  if (debugAuthNoAccountLimit()) {
    return;
  }
  final Preferences preferences = ref.read(preferencesProvider);
  final storedDate = preferences.accountCreationLastDate;

  final creationDate = DateTime.parse(storedDate);
  final currentDate = DateTime.now();
  final difference = currentDate.difference(creationDate);

  if (difference.inDays < accountCreationLimitDays) {
    throw AuthException(code: 'limit-account-creation');
  }
}

Future<void> _updateAccountCreationLastDate(WidgetRef ref) async {
  await ref.read(preferencesProvider.notifier).updateAccountCreationLastDate();
}
