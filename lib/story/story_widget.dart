import '../backend/api_requests/api_calls.dart';
import '../flutter_flow/flutter_flow_theme.dart';
import '../flutter_flow/flutter_flow_util.dart';
import '../flutter_flow/flutter_flow_widgets.dart';
import '../flutter_flow/custom_functions.dart' as functions;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';

class StoryWidget extends StatefulWidget {
  const StoryWidget({Key? key}) : super(key: key);

  @override
  _StoryWidgetState createState() => _StoryWidgetState();
}

class _StoryWidgetState extends State<StoryWidget> {
  ApiCallResponse? apiResultcqt;
  final _unfocusNode = FocusNode();
  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    // On page load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      apiResultcqt = await OpenAiBedtimeStoryCall.call(
        prompt: functions.storyGetPrompt(FFAppState().questions.toList()),
      );
      if ((apiResultcqt?.succeeded ?? true)) {
        FFAppState().update(() {
          FFAppState().storyText = OpenAiBedtimeStoryCall.text(
            (apiResultcqt?.jsonBody ?? ''),
          ).toString();
        });
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
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.max,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Expanded(
                      child: Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(20, 20, 20, 20),
                        child: InkWell(
                          onTap: () async {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                  functions.storyGetPrompt(
                                      FFAppState().questions.toList()),
                                  style: TextStyle(
                                    color: FlutterFlowTheme.of(context)
                                        .primaryText,
                                    fontWeight: FontWeight.normal,
                                  ),
                                ),
                                duration: Duration(milliseconds: 10000),
                                backgroundColor: Color(0x00000000),
                              ),
                            );
                          },
                          child: Text(
                            'The story of ${functions.utilsGetAnswer('character', FFAppState().questions.toList())}, who is ${functions.utilsGetAnswer('power', FFAppState().questions.toList())}.',
                            textAlign: TextAlign.center,
                            style: FlutterFlowTheme.of(context).subtitle1,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      FutureBuilder<ApiCallResponse>(
                        future: OpenAiDalleCall.call(
                          characterType: functions.utilsGetAnswer(
                              'characterType', FFAppState().questions.toList()),
                          location: functions.utilsGetAnswer(
                              'location', FFAppState().questions.toList()),
                        ),
                        builder: (context, snapshot) {
                          // Customize what your widget looks like when it's loading.
                          if (!snapshot.hasData) {
                            return Center(
                              child: SizedBox(
                                width: 50,
                                height: 50,
                                child: CircularProgressIndicator(
                                  color:
                                      FlutterFlowTheme.of(context).primaryColor,
                                ),
                              ),
                            );
                          }
                          final imageOpenAiDalleResponse = snapshot.data!;
                          return ClipRRect(
                            borderRadius: BorderRadius.circular(15),
                            child: Image.network(
                              FFAppState().storyImage,
                              width: 180,
                              height: 180,
                              fit: BoxFit.cover,
                            ),
                          );
                        },
                      ),
                      Align(
                        alignment: AlignmentDirectional(0, 0),
                        child: Padding(
                          padding:
                              EdgeInsetsDirectional.fromSTEB(20, 10, 20, 20),
                          child: Text(
                            FFAppState().storyText,
                            textAlign: TextAlign.start,
                            style:
                                FlutterFlowTheme.of(context).bodyText1.override(
                                      fontFamily: 'Outfit',
                                      fontSize: 18,
                                      fontWeight: FontWeight.normal,
                                      lineHeight: 1.5,
                                    ),
                          ),
                        ),
                      ),
                      Builder(
                        builder: (context) => FFButtonWidget(
                          onPressed: () async {
                            await Share.share(
                              FFAppState().storyText,
                              sharePositionOrigin:
                                  getWidgetBoundingBox(context),
                            );
                          },
                          text: FFLocalizations.of(context).getText(
                            'gshkc43r' /* Share */,
                          ),
                          options: FFButtonOptions(
                            width: 130,
                            height: 40,
                            color: FlutterFlowTheme.of(context).primaryColor,
                            textStyle:
                                FlutterFlowTheme.of(context).subtitle2.override(
                                      fontFamily: 'Outfit',
                                      color: Colors.white,
                                      fontSize: 18,
                                    ),
                            borderSide: BorderSide(
                              color: Colors.transparent,
                              width: 1,
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
