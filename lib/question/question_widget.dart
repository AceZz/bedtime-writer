import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../flutter_flow/flutter_flow_util.dart';
import 'question_choice_button_widget.dart';

class QuestionWidget extends StatefulWidget {
  const QuestionWidget({
    Key? key,
    int? questionIndex,
  })  : this.questionIndex = questionIndex ?? 0,
        super(key: key);

  final int questionIndex;

  @override
  _QuestionWidgetState createState() => _QuestionWidgetState();
}

class _QuestionWidgetState extends State<QuestionWidget> {
  final _unfocusNode = FocusNode();
  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();

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
            children: [
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(20, 20, 20, 20),
                child: Text(
                  getJsonField(
                    FFAppState().questions[widget.questionIndex],
                    r'''$.text''',
                  ).toString(),
                  textAlign: TextAlign.center,
                  style: Theme.of(context).primaryTextTheme.headlineMedium,
                ),
              ),
              Align(
                alignment: AlignmentDirectional(0, 0),
                child: Column(
                  mainAxisSize: MainAxisSize.max,
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Padding(
                      padding: EdgeInsetsDirectional.fromSTEB(30, 30, 30, 30),
                      child: Container(
                        width: MediaQuery.of(context).size.width * 0.6,
                        height: MediaQuery.of(context).size.height * 0.15,
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.background,
                        ),
                        child: QuestionChoiceButtonWidget(
                          questionIndex: widget.questionIndex,
                          choiceIndex: 0,
                        ),
                      ),
                    ),
                    Padding(
                      padding: EdgeInsetsDirectional.fromSTEB(30, 30, 30, 30),
                      child: Container(
                        width: MediaQuery.of(context).size.width * 0.6,
                        height: MediaQuery.of(context).size.height * 0.15,
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.background,
                        ),
                        child: QuestionChoiceButtonWidget(
                          questionIndex: widget.questionIndex,
                          choiceIndex: 1,
                        ),
                      ),
                    ),
                    Padding(
                      padding: EdgeInsetsDirectional.fromSTEB(30, 30, 30, 30),
                      child: Container(
                        width: MediaQuery.of(context).size.width * 0.6,
                        height: MediaQuery.of(context).size.height * 0.15,
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.background,
                        ),
                        child: QuestionChoiceButtonWidget(
                          questionIndex: widget.questionIndex,
                          choiceIndex: 2,
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
    );
  }
}
