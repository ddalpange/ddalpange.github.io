---
publish: true
Published Date: 2026-06-25
sidebar: false
---
서버<->클라이언트 통신에 있어 제품마다 Protobuf 또는 OpenApi Spec(Rest Api)을 주요 스키마로 사용하고 있었어요. 스키마를 기반으로 엔지니어들간에 워크플로우와 커뮤니케이션을 스키마를 기반으로 이야기하고 통합 개발 할 수 있도록 개선했어요. 

 - Protobuf 기반으로 webview와 native, server 인터페이스 작성
 - 작성된 schema를 통해 반복적인 코드를 기계적으로 자동 생성
 - Open API Schema를 기반으로 rest api들의 반복적인 코드를 기계적으로 자동 생성
 - 스키마 저장소를 분리하여 PR을 통해 api tech spec 논의
