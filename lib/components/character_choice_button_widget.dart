import '../components/icon_text_widget.dart';
import '../flutter_flow/flutter_flow_theme.dart';
import '../flutter_flow/flutter_flow_util.dart';
import '../flutter_flow/custom_functions.dart' as functions;
import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class CharacterChoiceButtonWidget extends StatefulWidget {
  const CharacterChoiceButtonWidget({
    Key? key,
    this.text,
    this.icon,
    this.characterName,
    this.characterType,
  }) : super(key: key);

  final String? text;
  final Widget? icon;
  final String? characterName;
  final String? characterType;

  @override
  _CharacterChoiceButtonWidgetState createState() =>
      _CharacterChoiceButtonWidgetState();
}

class _CharacterChoiceButtonWidgetState
    extends State<CharacterChoiceButtonWidget> {
  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) => setState(() {}));
  }

  @override
  Widget build(BuildContext context) {
    context.watch<FFAppState>();

    return InkWell(
      onTap: () async {
        FFAppState().update(() {
          FFAppState().questions = functions
              .characterInitQuestions(
                  widget.characterName!, widget.characterType!)
              .toList();
        });

        context.pushNamed(
          'Question',
          queryParams: {
            'questionIndex': serializeParam(
              functions.utilsGetNextQuestionIndex(
                  0, FFAppState().questions.toList()),
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
      },
      child: IconTextWidget(
        text: widget.text,
        icon: widget.icon,
      ),
    );
  }
}
