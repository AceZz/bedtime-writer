import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../widgets/string_icon.dart';
import '../flutter_flow/custom_functions.dart' as functions;
import '../flutter_flow/flutter_flow_theme.dart';
import '../flutter_flow/flutter_flow_util.dart';

class QuestionChoiceButtonWidget extends StatefulWidget {
  const QuestionChoiceButtonWidget({
    Key? key,
    this.questionIndex,
    this.choiceIndex,
  }) : super(key: key);

  final int? questionIndex;
  final int? choiceIndex;

  @override
  _QuestionChoiceButtonWidgetState createState() =>
      _QuestionChoiceButtonWidgetState();
}

class _QuestionChoiceButtonWidgetState
    extends State<QuestionChoiceButtonWidget> {
  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) => setState(() {}));
  }

  @override
  Widget build(BuildContext context) {
    context.watch<FFAppState>();

    return Visibility(
      visible: functions.questionIsChoiceAvailable(widget.questionIndex!,
          widget.choiceIndex!, FFAppState().questions.toList()),
      child: InkWell(
        onTap: () async {
          FFAppState().update(() {
            FFAppState().questions = functions
                .questionSetAnswer(widget.questionIndex!, widget.choiceIndex!,
                    FFAppState().questions.toList())
                .toList();
          });
          if (functions.utilsGetNextQuestionIndex(
                  widget.questionIndex!, FFAppState().questions.toList()) <
              FFAppState().questions.length) {
            context.pushNamed(
              'Question',
              queryParams: {
                'questionIndex': serializeParam(
                  functions.utilsGetNextQuestionIndex(
                      widget.questionIndex!, FFAppState().questions.toList()),
                  ParamType.int,
                ),
              }.withoutNulls,
              extra: <String, dynamic>{
                kTransitionInfoKey: TransitionInfo(
                  hasTransition: true,
                  transitionType: PageTransitionType.rightToLeft,
                ),
              },
            );
          } else {
            context.pushNamed(
              'Loading',
              extra: <String, dynamic>{
                kTransitionInfoKey: TransitionInfo(
                  hasTransition: true,
                  transitionType: PageTransitionType.rightToLeft,
                ),
              },
            );
          }
        },
        child: Container(
          width: MediaQuery.of(context).size.width,
          height: MediaQuery.of(context).size.height * 1,
          decoration: BoxDecoration(
            color: FlutterFlowTheme.of(context).alternate,
            boxShadow: [
              BoxShadow(
                blurRadius: 12,
                color: Color(0x33000000),
                offset: Offset(0, 5),
              )
            ],
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.max,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (functions.questionGetChoiceIcon(widget.questionIndex!,
                      widget.choiceIndex!, FFAppState().questions.toList()) !=
                  '')
                Container(
                  width: 60,
                  height: 60,
                  child: StringIcon(
                    width: 60,
                    height: 60,
                    icon: functions.questionGetChoiceIcon(widget.questionIndex!,
                        widget.choiceIndex!, FFAppState().questions.toList()),
                  ),
                ),
              Text(
                functions.questionGetChoiceText(widget.questionIndex!,
                    widget.choiceIndex!, FFAppState().questions.toList()),
                textAlign: TextAlign.center,
                style: FlutterFlowTheme.of(context).bodyText1.override(
                      fontFamily: 'Outfit',
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
