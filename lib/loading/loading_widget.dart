import '../backend/api_requests/api_calls.dart';
import '../flutter_flow/flutter_flow_theme.dart';
import '../flutter_flow/flutter_flow_util.dart';
import '../flutter_flow/custom_functions.dart' as functions;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';

class LoadingWidget extends StatefulWidget {
  const LoadingWidget({Key? key}) : super(key: key);

  @override
  _LoadingWidgetState createState() => _LoadingWidgetState();
}

class _LoadingWidgetState extends State<LoadingWidget> {
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
      if ((apiResultrre?.succeeded ?? true)) {
        FFAppState().update(() {
          FFAppState().storyText = OpenAiBedtimeStoryCall.text(
            (apiResultrre?.jsonBody ?? ''),
          ).toString();
        });
        apiResult9mp = await OpenAiDalleCall.call(
          characterType: FFAppState().characterType,
          location: functions.utilsGetAnswer(
              'location', FFAppState().questions.toList()),
        );
        if ((apiResult9mp?.succeeded ?? true)) {
          FFAppState().update(() {
            FFAppState().storyImage = OpenAiDalleCall.url(
              (apiResult9mp?.jsonBody ?? ''),
            );
          });

          context.pushNamed('Story');
        }
      }
    });
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
      backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
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
                  width: 150,
                  height: 130,
                  fit: BoxFit.cover,
                  animate: true,
                ),
              ),
              Text(
                FFLocalizations.of(context).getText(
                  'ar0rrzuk' /* Your story is being created... */,
                ),
                style: FlutterFlowTheme.of(context).bodyText1.override(
                      fontFamily: 'Outfit',
                      fontSize: 24,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
