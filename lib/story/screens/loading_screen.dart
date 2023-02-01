import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';

import '../../flutter_flow/custom_functions.dart' as functions;
import '../../flutter_flow/flutter_flow_util.dart';
import '../backend/api_calls.dart';

class LoadingScreen extends StatefulWidget {
  const LoadingScreen({Key? key}) : super(key: key);

  @override
  _LoadingScreenState createState() => _LoadingScreenState();
}

class _LoadingScreenState extends State<LoadingScreen> {
  ApiCallResponse? apiResult9mp;
  ApiCallResponse? apiResultrre;
  final _unfocusNode = FocusNode();
  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    // On page load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      apiResultrre = await OpenAiBedtimeStoryCall.call(
        prompt: functions.storyGetPrompt(FFAppState().questions.toList()),
      );
      apiResult9mp = await OpenAiDalleCall.call(
        characterType: functions.utilsGetAnswer(
            'characterType', FFAppState().questions.toList()),
        location: functions.utilsGetAnswer(
            'location', FFAppState().questions.toList()),
      );
      if ((apiResultrre?.succeeded ?? true)) {
        if ((apiResult9mp?.succeeded ?? true)) {
          FFAppState().update(() {
            FFAppState().storyImage = OpenAiDalleCall.url(
              (apiResult9mp?.jsonBody ?? ''),
            );
          });
          FFAppState().update(() {
            FFAppState().storyText = OpenAiBedtimeStoryCall.text(
              (apiResultrre?.jsonBody ?? ''),
            ).toString();
          });

          context.goNamed('story');
        }
      }
    });

    WidgetsBinding.instance.addPostFrameCallback((_) => setState(() {}));
  }

  @override
  void dispose() {
    _unfocusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<FFAppState>();

    return Scaffold(
      key: scaffoldKey,
      backgroundColor: Theme.of(context).colorScheme.background,
      body: SafeArea(
        child: GestureDetector(
          onTap: () => FocusScope.of(context).requestFocus(_unfocusNode),
          child: Column(
            mainAxisSize: MainAxisSize.max,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Align(
                alignment: AlignmentDirectional(0, 0),
                child: Lottie.network(
                  'https://assets2.lottiefiles.com/packages/lf20_aZTdD5.json',
                  width: 180,
                  height: 180,
                  fit: BoxFit.cover,
                  animate: true,
                ),
              ),
              Text(
                'Your story is being created...',
                style: Theme.of(context).primaryTextTheme.headlineSmall,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
