import 'package:flutter/material.dart';

/// Augmented [Scaffold] that comes with a full-width [Container].
///
/// Unless exception, every screen will use this class as a base widget.
class AppScaffold extends StatelessWidget {
  final Widget child;
  final bool showAppBar;
  final String appBarTitle;

  const AppScaffold({
    Key? key,
    required this.child,
    this.showAppBar = true,
    this.appBarTitle = '',
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Widget titleWidget = Text(
      appBarTitle,
      style: Theme.of(context).primaryTextTheme.headlineSmall,
    );

    Widget screenBodyWidget = Container(
      width: MediaQuery.of(context).size.width,
      child: child,
    );

    Widget nestedScrollViewWidget = NestedScrollView(
      floatHeaderSlivers: true,
      headerSliverBuilder: (context, innerBoxIsScrolled) => [
        SliverAppBar(
          floating: true,
          snap: true,
          title: titleWidget,
        ),
      ],
      body: screenBodyWidget,
    );

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      body: showAppBar
          ? SafeArea(child: nestedScrollViewWidget)
          : SafeArea(child: screenBodyWidget),
    );
  }
}
