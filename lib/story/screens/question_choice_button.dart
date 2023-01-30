import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../widgets/string_icon.dart';
import '../../flutter_flow/custom_functions.dart' as functions;
import '../../flutter_flow/flutter_flow_util.dart';

class QuestionChoiceButton extends StatefulWidget {
  const QuestionChoiceButton({
    Key? key,
    this.questionIndex,
    this.choiceIndex,
  }) : super(key: key);

  final int? questionIndex;
  final int? choiceIndex;

  @override
  _QuestionChoiceButtonState createState() =>
      _QuestionChoiceButtonState();
}

class _QuestionChoiceButtonState
    extends State<QuestionChoiceButton> {
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
            color: Theme.of(context).colorScheme.primary,
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
                style: Theme.of(context).primaryTextTheme.titleMedium,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
