import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../widgets/app_scaffold.dart';

class _AgeDropdown extends StatefulWidget {
  const _AgeDropdown({Key? key}) : super(key: key);

  @override
  State<_AgeDropdown> createState() => _AgeDropdownState();
}

class _AgeDropdownState extends State<_AgeDropdown> {
  int age = 5;

  void _initAge() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      age = prefs.getInt('age') ?? age;
    });
  }

  @override
  void initState() {
    super.initState();
    _initAge();
  }

  @override
  Widget build(BuildContext context) {
    return DropdownButton<int>(
      value: age,
      onChanged: (int? newAge) async {
        setState(() {
          age = newAge!;
        });

        final prefs = await SharedPreferences.getInstance();
        await prefs.setInt('age', newAge!);
      },
      items: [3, 4, 5, 6, 7].map<DropdownMenuItem<int>>((int value) {
        return DropdownMenuItem<int>(
          value: value,
          child: Text(
            value.toString(),
            style: Theme.of(context).primaryTextTheme.bodyMedium,
          ),
        );
      }).toList(),
    );
  }
}

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Widget age = Padding(
      padding: const EdgeInsets.only(left: 20.0),
      child: Row(
        children: [
          Text(
            'Age of the child:',
            style: Theme.of(context).primaryTextTheme.bodyMedium,
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10.0),
            child: const _AgeDropdown(),
          ),
          Text(
            'years old',
            style: Theme.of(context).primaryTextTheme.bodyMedium,
          ),
        ],
      ),
    );

    return AppScaffold(
      appBarTitle: 'Settings',
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          age,
        ],
      ),
    );
  }
}
