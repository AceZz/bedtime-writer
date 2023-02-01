import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../flutter_flow/flutter_flow_util.dart';

class IconTextWidget extends StatefulWidget {
  const IconTextWidget({
    Key? key,
    this.text,
    this.icon,
  }) : super(key: key);

  final String? text;
  final Widget? icon;

  @override
  _IconTextWidgetState createState() => _IconTextWidgetState();
}

class _IconTextWidgetState extends State<IconTextWidget> {
  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) => setState(() {}));
  }

  @override
  Widget build(BuildContext context) {
    context.watch<FFAppState>();

    return Container(
      width: MediaQuery.of(context).size.width,
      height: MediaQuery.of(context).size.height * 1,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary,
        borderRadius: BorderRadius.circular(20),
        shape: BoxShape.rectangle,
      ),
      alignment: AlignmentDirectional(0, 0),
      child: Column(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          widget.icon!,
          Text(
            widget.text!,
            textAlign: TextAlign.center,
            style: Theme.of(context).primaryTextTheme.titleMedium,
          ),
        ],
      ),
    );
  }
}
