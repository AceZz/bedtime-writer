import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:provider/provider.dart';

import '../flutter_flow/flutter_flow_util.dart';
import 'character_choice_button_widget.dart';

class CharacterWidget extends StatefulWidget {
  const CharacterWidget({Key? key}) : super(key: key);

  @override
  _CharacterWidgetState createState() => _CharacterWidgetState();
}

class _CharacterWidgetState extends State<CharacterWidget> {
  final _unfocusNode = FocusNode();
  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    // On page load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      FFAppState().update(() {
        FFAppState().lottieUrl =
            'https://assets2.lottiefiles.com/packages/lf20_aZTdD5.json';
      });
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
            children: [
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(20, 20, 20, 20),
                child: Text(
                  "Tonight's story main character is:",
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
                        child: CharacterChoiceButtonWidget(
                          text: 'Blaze, the kind dragon',
                          icon: FaIcon(
                            FontAwesomeIcons.dragon,
                            color: Theme.of(context).colorScheme.onPrimary,
                            size: 50,
                          ),
                          characterType: 'dragon',
                          characterName: 'Blaze',
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
                        child: CharacterChoiceButtonWidget(
                          text: 'Sparkles, the magical horse',
                          icon: FaIcon(
                            FontAwesomeIcons.horseHead,
                            color: Theme.of(context).colorScheme.onPrimary,
                            size: 50,
                          ),
                          characterType: 'horse',
                          characterName: 'Sparkles',
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
                        child: CharacterChoiceButtonWidget(
                          text: 'Captain Courage, the pirate',
                          icon: FaIcon(
                            FontAwesomeIcons.skullCrossbones,
                            color: Theme.of(context).colorScheme.onPrimary,
                            size: 50,
                          ),
                          characterType: 'pirate',
                          characterName: 'Captain Courage',
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
